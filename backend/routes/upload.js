import express    from 'express';
import rateLimit  from 'express-rate-limit';
import { protect }                                              from '../middleware/auth.js';
import { handlePDFUpload, deletePDFFile,
         handleImageUpload, deleteImageFile }                   from '../middleware/upload.js';
import SiteConfig from '../models/SiteConfig.js';

const router = express.Router();

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  message: { message: 'Too many uploads. Try again later.' },
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

// ── Resume (PDF only, single active file) ────────────────────────────────────

// POST /api/upload/resume
// Uploads a new resume PDF, deletes the old one, saves URL to SiteConfig
router.post('/resume', protect, uploadLimiter, handlePDFUpload, async (req, res) => {
  try {
    // Delete the previous resume file from disk (if any)
    const config = await SiteConfig.findOne().lean();
    if (config?.resume?.filename) {
      deletePDFFile(config.resume.filename); // best-effort — ignore errors
    }

    const { url, filename } = req.uploadedPDF;

    // Persist new resume URL in SiteConfig
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

// DELETE /api/upload/resume
// Removes the current resume file from disk and clears SiteConfig.resume
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

