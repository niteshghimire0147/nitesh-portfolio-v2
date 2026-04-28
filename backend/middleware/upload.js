import multer from 'multer';
import path   from 'path';
import fs     from 'fs';
import crypto from 'crypto';

const UPLOAD_DIR  = './uploads/pdfs';
const MAX_SIZE    = 10 * 1024 * 1024;                        // 10 MB
const PDF_MAGIC   = Buffer.from([0x25, 0x50, 0x44, 0x46]);  // %PDF

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Layer 1 & 2: MIME type + extension checked in fileFilter before any bytes hit memory
function fileFilter(_req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext !== '.pdf' || file.mimetype !== 'application/pdf') {
    return cb(Object.assign(new Error('Only PDF files are allowed.'), { status: 400 }), false);
  }
  cb(null, true);
}

// Use memory storage so we can inspect magic bytes before touching disk
const multerPDF = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: MAX_SIZE, files: 1 },
  fileFilter,
}).single('pdf');

/** Layer 3: magic-byte check + Layer 4: UUID rename before write to disk */
export function handlePDFUpload(req, res, next) {
  multerPDF(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      const msg = err.code === 'LIMIT_FILE_SIZE'
        ? 'File too large. Maximum 10 MB allowed.'
        : err.message;
      return res.status(400).json({ message: msg });
    }
    if (err) return res.status(400).json({ message: err.message });
    if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });

    const buf = req.file.buffer;

    // Layer 3: verify %PDF magic bytes — rejects renamed non-PDF files
    if (buf.length < 4 || !buf.subarray(0, 4).equals(PDF_MAGIC)) {
      return res.status(400).json({ message: 'File is not a valid PDF.' });
    }

    // Layer 4: random UUID filename — prevents path traversal & overwrite attacks
    const filename = `${crypto.randomUUID()}.pdf`;
    const filepath = path.join(UPLOAD_DIR, filename);

    fs.writeFile(filepath, buf, (writeErr) => {
      if (writeErr) {
        console.error('[UPLOAD] write error:', writeErr.message);
        return res.status(500).json({ message: 'Failed to save file.' });
      }
      req.uploadedPDF = { filename, url: `/uploads/pdfs/${filename}` };
      next();
    });
  });
}

/** Delete a PDF by UUID filename (validates format before touching disk) */
export function deletePDFFile(filename) {
  // Only allow UUID.pdf format
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.pdf$/i.test(filename)) {
    return false;
  }
  const filepath = path.join(UPLOAD_DIR, filename);
  try { fs.unlinkSync(filepath); return true; } catch { return false; }
}
