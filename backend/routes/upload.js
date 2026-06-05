import express    from 'express';
import path       from 'path';
import fs         from 'fs';
import rateLimit  from 'express-rate-limit';
import { fileURLToPath } from 'url';
import { protect }                                              from '../middleware/auth.js';
import { handlePDFUpload, deletePDFFile,
         handleImageUpload, deleteImageFile }                   from '../middleware/upload.js';
import SiteConfig from '../models/SiteConfig.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const router = express.Router();

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  message: { message: 'Too many uploads. Try again later.' },
});

// Rate-limit resume downloads: 30 per hour per IP
const downloadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  message: { message: 'Too many download requests. Try again later.' },
});

// ── Public resume download (path-opaque) ────────────────────────────────────
//
// GET /api/download/resume
// - URL is always /api/download/resume — UUID filename is NEVER sent to client
// - Actual file path resolved server-side from SiteConfig (not from request)
// - Content-Disposition: attachment with clean display name (not UUID)
// - no-store cache: fresh DB lookup each time
// - Rate limited to prevent scraping / DoS
//
router.get('/resume', downloadLimiter, async (req, res) => {
  try {
    const config   = await SiteConfig.findOne().lean();
    const filename = config?.resume?.filename;

    if (!filename) {
      return res.status(404).json({ message: 'No resume available.' });
    }

    // Validate UUID format — reject anything that looks tampered
    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.pdf$/i;
    if (!UUID_RE.test(filename)) {
      return res.status(404).json({ message: 'No resume available.' });
    }

    const uploadBase = path.resolve(__dirname, '..', 'uploads', 'pdfs');
    const fullPath   = path.resolve(uploadBase, filename);

    // Path traversal guard — resolved path must stay inside uploadBase
    if (!fullPath.startsWith(uploadBase + path.sep) && fullPath !== uploadBase) {
      return res.status(404).json({ message: 'No resume available.' });
    }

    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ message: 'Resume file not found on disk.' });
    }

    // Security headers
    res.setHeader('Content-Type',           'application/pdf');
    // Clean download name — UUID never appears here
    res.setHeader('Content-Disposition',    'attachment; filename="Nitesh_Ghimire_Resume.pdf"');
    // No caching — so each download hits the DB and gets current version
    res.setHeader('Cache-Control',          'no-store, no-cache, must-revalidate');
    res.setHeader('Pragma',                 'no-cache');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.removeHeader('X-Powered-By');

    res.sendFile(fullPath);
  } catch {
    res.status(500).json({ message: 'Download failed.' });
  }
});

// ── PDF ───────────────────────────────────────────────────────────────────────

// POST /api/upload/pdf  — admin only
router.post('/pdf', protect, uploadLimiter, handlePDFUpload, (req, res) => {
  res.json({ url: req.uploadedPDF.url, filename: req.uploadedPDF.filename });
});

// DELETE /api/upload/pdf/:filename  — admin only
router.delete('/pdf/:filename', protect, (req, res) => {
  const deleted = deletePDFFile(req.params.filename);
  if (!deleted) return res.status(400).json({ message: 'Invalid filename or file not found.' });
  res.json({ message: 'File deleted.' });
});

// ── Image (PNG / JPG) ─────────────────────────────────────────────────────────

// POST /api/upload/image  — admin only
router.post('/image', protect, uploadLimiter, handleImageUpload, (req, res) => {
  res.json({ url: req.uploadedImage.url, filename: req.uploadedImage.filename });
});

// DELETE /api/upload/image/:filename  — admin only
router.delete('/image/:filename', protect, (req, res) => {
  const deleted = deleteImageFile(req.params.filename);
  if (!deleted) return res.status(400).json({ message: 'Invalid filename or file not found.' });
  res.json({ message: 'Image deleted.' });
});

// ── Resume upload/management (admin only) ────────────────────────────────────

// POST /api/upload/resume — upload new resume, old one auto-deleted
router.post('/resume', protect, uploadLimiter, handlePDFUpload, async (req, res) => {
  try {
    const config = await SiteConfig.findOne().lean();
    if (config?.resume?.filename) {
      deletePDFFile(config.resume.filename); // best-effort — ignore errors
    }

    const { url, filename } = req.uploadedPDF;

    await SiteConfig.findOneAndUpdate(
      {},
      { $set: { resume: { url, filename } } },
      { upsert: true }
    );

    res.json({ url, filename });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/upload/resume — remove resume from disk and clear SiteConfig
router.delete('/resume', protect, async (req, res) => {
  try {
    const config = await SiteConfig.findOne().lean();
    if (config?.resume?.filename) {
      deletePDFFile(config.resume.filename);
    }

    await SiteConfig.findOneAndUpdate(
      {},
      { $set: { resume: { url: '', filename: '' } } },
      { upsert: true }
    );

    res.json({ message: 'Resume removed.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
