import multer from 'multer';
import path   from 'path';
import fs     from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// ── PDF upload config ────────────────────────────────────────────────────────

// Absolute paths — prevents CWD-relative failures on live hosting
const PDF_UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'pdfs');
const PDF_MAX_SIZE   = 10 * 1024 * 1024;                        // 10 MB
const PDF_MAGIC      = Buffer.from([0x25, 0x50, 0x44, 0x46]);  // %PDF

if (!fs.existsSync(PDF_UPLOAD_DIR)) fs.mkdirSync(PDF_UPLOAD_DIR, { recursive: true });

// Layer 1 & 2: MIME type + extension checked in fileFilter before any bytes hit memory
function pdfFileFilter(_req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext !== '.pdf' || file.mimetype !== 'application/pdf') {
    return cb(Object.assign(new Error('Only PDF files are allowed.'), { status: 400 }), false);
  }
  cb(null, true);
}

const multerPDF = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: PDF_MAX_SIZE, files: 1 },
  fileFilter: pdfFileFilter,
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
    const filepath = path.join(PDF_UPLOAD_DIR, filename);

    fs.writeFile(filepath, buf, (writeErr) => {
      if (writeErr) {
        console.error('[UPLOAD] write error:', writeErr.message);
        return res.status(500).json({ message: 'Failed to save file.' });
      }
      // Use /api/uploads/ prefix so the API route handles serving (not express.static)
      req.uploadedPDF = { filename, url: `/api/uploads/pdfs/${filename}` };
      next();
    });
  });
}

/** Delete a PDF by UUID filename (validates format before touching disk) */
export function deletePDFFile(filename) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.pdf$/i.test(filename)) {
    return false;
  }
  const filepath = path.join(PDF_UPLOAD_DIR, filename);
  // Path traversal double-check: ensure resolved path stays within upload dir
  if (!path.resolve(filepath).startsWith(path.resolve(PDF_UPLOAD_DIR))) return false;
  try { fs.unlinkSync(filepath); return true; } catch { return false; }
}

// ── Image upload config (PNG / JPG only) ─────────────────────────────────────

const IMG_UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'images');
const IMG_MAX_SIZE   = 5 * 1024 * 1024; // 5 MB

// Magic bytes for PNG and JPEG
const PNG_MAGIC  = Buffer.from([0x89, 0x50, 0x4e, 0x47]); // \x89PNG
const JPEG_MAGIC = Buffer.from([0xff, 0xd8, 0xff]);        // SOI marker

const ALLOWED_IMG_EXTS  = new Set(['.png', '.jpg', '.jpeg']);
const ALLOWED_IMG_MIMES = new Set(['image/png', 'image/jpeg', 'image/jpg']);

if (!fs.existsSync(IMG_UPLOAD_DIR)) fs.mkdirSync(IMG_UPLOAD_DIR, { recursive: true });

function imageFileFilter(_req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_IMG_EXTS.has(ext) || !ALLOWED_IMG_MIMES.has(file.mimetype)) {
    return cb(Object.assign(new Error('Only PNG and JPG images are allowed.'), { status: 400 }), false);
  }
  cb(null, true);
}

const multerImage = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: IMG_MAX_SIZE, files: 1 },
  fileFilter: imageFileFilter,
}).single('image');

/** Handles image upload: validates magic bytes, saves with UUID filename */
export function handleImageUpload(req, res, next) {
  multerImage(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      const msg = err.code === 'LIMIT_FILE_SIZE'
        ? 'Image too large. Maximum 5 MB allowed.'
        : err.message;
      return res.status(400).json({ message: msg });
    }
    if (err) return res.status(400).json({ message: err.message });
    if (!req.file) return res.status(400).json({ message: 'No image uploaded.' });

    const buf = req.file.buffer;
    const ext = path.extname(req.file.originalname).toLowerCase();

    // Verify magic bytes match declared type
    const isPng  = buf.length >= 4 && buf.subarray(0, 4).equals(PNG_MAGIC);
    const isJpeg = buf.length >= 3 && buf.subarray(0, 3).equals(JPEG_MAGIC);

    if (!isPng && !isJpeg) {
      return res.status(400).json({ message: 'File is not a valid PNG or JPG image.' });
    }

    // Normalise extension: always .jpg for JPEG regardless of .jpeg input
    const safeExt  = isPng ? '.png' : '.jpg';
    const filename = `${crypto.randomUUID()}${safeExt}`;
    const filepath = path.join(IMG_UPLOAD_DIR, filename);

    fs.writeFile(filepath, buf, (writeErr) => {
      if (writeErr) {
        console.error('[UPLOAD] image write error:', writeErr.message);
        return res.status(500).json({ message: 'Failed to save image.' });
      }
      // Use /api/uploads/ prefix so the API route handles serving
      req.uploadedImage = { filename, url: `/api/uploads/images/${filename}` };
      next();
    });
  });
}

/** Delete an image by UUID filename */
export function deleteImageFile(filename) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(png|jpg)$/i.test(filename)) {
    return false;
  }
  const filepath = path.join(IMG_UPLOAD_DIR, filename);
  // Path traversal double-check
  if (!path.resolve(filepath).startsWith(path.resolve(IMG_UPLOAD_DIR))) return false;
  try { fs.unlinkSync(filepath); return true; } catch { return false; }
}
