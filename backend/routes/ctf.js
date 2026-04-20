import express    from 'express';
import mongoose    from 'mongoose';
import rateLimit   from 'express-rate-limit';
import CTF         from '../models/CTF.js';
import { protect } from '../middleware/auth.js';

const listLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 min
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests. Slow down.' },
});

const router = express.Router();

function sanitizeSlug(raw) {
  return raw
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100);
}

function pickCTFFields(body) {
  const { title, slug, platform, difficulty, category, excerpt, content, tags, points, published, solvedAt } = body;
  return { title, slug, platform, difficulty, category, excerpt, content, tags, points, published, solvedAt };
}

// ─── Public ──────────────────────────────────────────────────────────────────

// GET /api/ctf
router.get('/', listLimiter, async (req, res) => {
  try {
    const { platform, difficulty, category, page = 1, limit = 20 } = req.query;
    const safeLimit = Math.min(Math.max(parseInt(limit) || 20, 1), 50);
    const safePage  = Math.max(parseInt(page) || 1, 1);
    const filter    = { published: true, deleted: { $ne: true } };
    if (platform)   filter.platform   = platform;
    if (difficulty) filter.difficulty = difficulty;
    if (category)   filter.category   = category;
    const ctfs  = await CTF.find(filter).sort({ createdAt: -1 }).skip((safePage - 1) * safeLimit).limit(safeLimit).lean();
    const total = await CTF.countDocuments(filter);
    res.json({ ctfs, total, pages: Math.ceil(total / safeLimit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/ctf/:slug
router.get('/:slug', async (req, res) => {
  try {
    const ctf = await CTF.findOne({ slug: req.params.slug, published: true, deleted: { $ne: true } }).lean();
    if (!ctf) return res.status(404).json({ message: 'Writeup not found' });
    res.json(ctf);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Admin (protected) ────────────────────────────────────────────────────────

// GET /api/ctf/admin/all
router.get('/admin/all', protect, async (req, res) => {
  try {
    const ctfs = await CTF.find({ deleted: { $ne: true } }).sort({ createdAt: -1 });
    res.json(ctfs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/ctf
router.post('/', protect, async (req, res) => {
  try {
    const fields = pickCTFFields(req.body);
    if (!fields.slug && fields.title) {
      fields.slug = sanitizeSlug(fields.title);
    } else if (fields.slug) {
      fields.slug = sanitizeSlug(fields.slug);
    }

    if (fields.content && fields.content.length > 500000) {
      return res.status(400).json({ message: 'Content exceeds maximum length (500 KB).' });
    }

    const existing = await CTF.findOne({ slug: fields.slug, deleted: { $ne: true } });
    if (existing) return res.status(400).json({ message: 'Slug already in use. Choose a different title or slug.' });

    const ctf = await CTF.create(fields);
    res.status(201).json(ctf);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/ctf/:id
router.put('/:id', protect, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id))
    return res.status(400).json({ message: 'Invalid ID' });
  try {
    const fields = pickCTFFields(req.body);
    if (fields.slug) fields.slug = sanitizeSlug(fields.slug);

    if (fields.slug) {
      const existing = await CTF.findOne({ slug: fields.slug, _id: { $ne: req.params.id }, deleted: { $ne: true } });
      if (existing) return res.status(400).json({ message: 'Slug already in use.' });
    }

    const ctf = await CTF.findByIdAndUpdate(req.params.id, fields, { new: true, runValidators: true });
    if (!ctf) return res.status(404).json({ message: 'Writeup not found' });
    res.json(ctf);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/ctf/:id  (soft delete)
router.delete('/:id', protect, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id))
    return res.status(400).json({ message: 'Invalid ID' });
  try {
    const ctf = await CTF.findByIdAndUpdate(
      req.params.id,
      { deleted: true, deletedAt: new Date(), published: false },
      { new: true }
    );
    if (!ctf) return res.status(404).json({ message: 'Writeup not found' });
    res.json({ message: 'Writeup deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
