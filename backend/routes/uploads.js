import express from 'express';
import path     from 'path';
import fs       from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const router = express.Router();

// Absolute path — survives process CWD changes on live hosting
const UPLOAD_BASE = path.resolve(__dirname, '..', 'uploads');

const VALID_TYPES = new Set(['images', 'pdfs']);
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(png|jpg|jpeg|pdf)$/i;

function resolveFile(type, filename) {
  if (!VALID_TYPES.has(type)) return null;
  if (!UUID_RE.test(filename)) return null;
  const fullPath = path.join(UPLOAD_BASE, type, filename);
  // Path traversal defence: reject anything that escapes UPLOAD_BASE
  if (!path.resolve(fullPath).startsWith(UPLOAD_BASE + path.sep) &&
      path.resolve(fullPath) !== UPLOAD_BASE) return null;
  if (!fs.existsSync(fullPath)) return null;
  return fullPath;
}

function contentType(filename) {
  const ext = path.extname(filename).toLowerCase();
  if (ext === '.png')               return 'image/png';
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.pdf')               return 'application/pdf';
  return 'application/octet-stream';
}

// GET /api/uploads/:type/:filename — public, no auth required
router.get('/:type/:filename', (req, res) => {
  const { type, filename } = req.params;
  const fullPath = resolveFile(type, filename);
  if (!fullPath) return res.status(404).json({ message: 'File not found' });

  const ct = contentType(filename);
  res.setHeader('Content-Type', ct);
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (type === 'pdfs') {
    // Force browser download — fixes "encoded path" and opens-in-tab issues
    res.setHeader('Content-Disposition', 'attachment; filename="resume.pdf"');
  } else {
    // Inline for images so they render in markdown
    res.setHeader('Content-Disposition', 'inline');
  }

  res.sendFile(fullPath);
});

export default router;
