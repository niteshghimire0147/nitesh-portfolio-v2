import express    from 'express';
import mongoose    from 'mongoose';
import rateLimit   from 'express-rate-limit';
import Blog        from '../models/Blog.js';
import { protect } from '../middleware/auth.js';

const listLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 min
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests. Slow down.' },
});

const router = express.Router();

// Per-slug view cooldown: ip+slug -> timestamp (prevents bot inflation)
const viewCooldown = new Map();
const VIEW_COOLDOWN_MS = 24 * 60 * 60 * 1000;

setInterval(() => {
  const now = Date.now();
  for (const [key, ts] of viewCooldown) {
    if (now - ts > VIEW_COOLDOWN_MS) viewCooldown.delete(key);
  }
}, 60 * 60 * 1000).unref();

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

function pickBlogFields(body) {
  const { title, slug, excerpt, content, tags, category, published, pdfUrl } = body;
  return { title, slug, excerpt, content, tags, category, published, pdfUrl };
}

// ─── Public ──────────────────────────────────────────────────────────────────

// GET /api/blogs
router.get('/', listLimiter, async (req, res) => {
  try {
    const { tag, category, page = 1, limit = 10 } = req.query;
    const safeLimit = Math.min(Math.max(parseInt(limit) || 10, 1), 50);
    const safePage  = Math.max(parseInt(page) || 1, 1);
    const filter    = { published: true, deleted: { $ne: true } };
    if (tag)      filter.tags = tag;
    if (category) filter.category = category;
    const blogs = await Blog.find(filter)
      .sort({ createdAt: -1 })
      .skip((safePage - 1) * safeLimit)
      .limit(safeLimit)
      .lean();
    const total = await Blog.countDocuments(filter);
    res.json({ blogs, total, pages: Math.ceil(total / safeLimit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/blogs/:slug
router.get('/:slug', async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug, published: true, deleted: { $ne: true } });
    if (!blog) return res.status(404).json({ message: 'Post not found' });

    // Rate-limit view increments: 1 per IP per slug per 24h
    const ip  = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket?.remoteAddress || 'unknown';
    const key = `${ip}:${req.params.slug}`;
    if (!viewCooldown.has(key)) {
      viewCooldown.set(key, Date.now());
      await Blog.findByIdAndUpdate(blog._id, { $inc: { views: 1 } });
    }

    res.json(blog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Admin (protected) ────────────────────────────────────────────────────────

// GET /api/blogs/admin/all
router.get('/admin/all', protect, async (req, res) => {
  try {
    const blogs = await Blog.find({ deleted: { $ne: true } }).sort({ createdAt: -1 });
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/blogs
router.post('/', protect, async (req, res) => {
  try {
    const fields = pickBlogFields(req.body);
    if (!fields.slug && fields.title) {
      fields.slug = sanitizeSlug(fields.title);
    } else if (fields.slug) {
      fields.slug = sanitizeSlug(fields.slug);
    }

    if (fields.content && fields.content.length > 500000) {
      return res.status(400).json({ message: 'Content exceeds maximum length (500 KB).' });
    }

    const existing = await Blog.findOne({ slug: fields.slug, deleted: { $ne: true } });
    if (existing) return res.status(400).json({ message: 'Slug already in use. Choose a different title or slug.' });

    const blog = await Blog.create(fields);
    res.status(201).json(blog);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/blogs/:id
router.put('/:id', protect, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id))
    return res.status(400).json({ message: 'Invalid ID' });
  try {
    const fields = pickBlogFields(req.body);
    if (fields.slug) fields.slug = sanitizeSlug(fields.slug);

    if (fields.slug) {
      const existing = await Blog.findOne({ slug: fields.slug, _id: { $ne: req.params.id }, deleted: { $ne: true } });
      if (existing) return res.status(400).json({ message: 'Slug already in use.' });
    }

    const blog = await Blog.findByIdAndUpdate(req.params.id, fields, { new: true, runValidators: true });
    if (!blog) return res.status(404).json({ message: 'Post not found' });
    res.json(blog);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/blogs/:id  (soft delete)
router.delete('/:id', protect, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id))
    return res.status(400).json({ message: 'Invalid ID' });
  try {
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { deleted: true, deletedAt: new Date(), published: false },
      { new: true }
    );
    if (!blog) return res.status(404).json({ message: 'Post not found' });
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
