import express    from 'express';
import rateLimit  from 'express-rate-limit';
import { protect }              from '../middleware/auth.js';
import { handlePDFUpload, deletePDFFile } from '../middleware/upload.js';

const router = express.Router();

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  message: { message: 'Too many uploads. Try again later.' },
});

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

export default router;
