import express from 'express';
import path     from 'path';
import fs       from 'fs';
import crypto   from 'crypto';

const router = express.Router();

const UPLOAD_BASE = path.resolve('uploads');

const VALID_TYPES = new Set(['images', 'pdfs']);
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(png|jpg|jpeg|pdf)$/i;

function resolveFile(type, filename) {
  if (!VALID_TYPES.has(type)) return null;
  if (!UUID_RE.test(filename)) return null;
  const fullPath = path.join(UPLOAD_BASE, type, filename);
  if (!fs.existsSync(fullPath)) return null;
  return fullPath;
}

function contentType(filename) {
  const ext = path.extname(filename).toLowerCase();
  if (ext === '.png') return 'image/png';
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.pdf') return 'application/pdf';
  return 'application/octet-stream';
}

router.get('/:type/:filename', (req, res) => {
  const { type, filename } = req.params;
  const fullPath = resolveFile(type, filename);
  if (!fullPath) return res.status(404).json({ message: 'File not found' });

  res.header('Content-Type', contentType(filename));
  res.header('Cache-Control', 'public, max-age=86400');
  res.sendFile(fullPath);
});

export default router;
