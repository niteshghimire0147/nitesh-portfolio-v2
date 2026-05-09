import express    from 'express';
import mongoose    from 'mongoose';
import Project     from '../models/Project.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const SAFE_URL_RE = /^https?:\/\/.+/i;

function sanitizeUrl(url) {
  if (!url) return '';
  const u = String(url).trim();
  return SAFE_URL_RE.test(u) ? u : '';
}

function pickProjectFields(body) {
  const { title, description, techStack, category, githubUrl, liveUrl, image, featured, hidden, order } = body;
  return {
    title, description, techStack, category,
    githubUrl: sanitizeUrl(githubUrl),
    liveUrl:   sanitizeUrl(liveUrl),
    image:     sanitizeUrl(image),
    featured, hidden, order,
  };
}

// GET /api/projects  — public (excludes deleted + hidden)
router.get('/', async (req, res) => {
  try {
    const { category, page = 1, limit = 50 } = req.query;
    const safeLimit = Math.min(Math.max(parseInt(limit) || 50, 1), 100);
    const safePage  = Math.max(parseInt(page) || 1, 1);
    const filter    = { deleted: { $ne: true }, hidden: { $ne: true } };
    if (category) filter.category = category;
    const projects = await Project.find(filter)
      .sort({ featured: -1, order: 1, createdAt: -1 })
      .skip((safePage - 1) * safeLimit)
      .limit(safeLimit)
      .lean();
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/projects/admin  — admin only (includes hidden AND deleted, for full management)
router.get('/admin', protect, async (req, res) => {
  try {
    const projects = await Project.find({})
      .sort({ featured: -1, order: 1, createdAt: -1 })
      .lean();
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/projects/suppressed  — public, returns just titles of hidden or deleted projects
// Frontend uses this to filter out static/GitHub items that have been suppressed via the CMS
router.get('/suppressed', async (req, res) => {
  try {
    const suppressed = await Project.find(
      { $or: [{ hidden: true }, { deleted: true }] },
      { title: 1, _id: 0 }
    ).lean();
    res.json(suppressed.map((p) => p.title.toLowerCase().trim()));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/projects
router.post('/', protect, async (req, res) => {
  try {
    const project = await Project.create(pickProjectFields(req.body));
    res.status(201).json(project);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/projects/:id
router.put('/:id', protect, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id))
    return res.status(400).json({ message: 'Invalid ID' });
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, pickProjectFields(req.body), {
      new: true,
      runValidators: true,
    });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/projects/:id  (soft delete)
router.delete('/:id', protect, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id))
    return res.status(400).json({ message: 'Invalid ID' });
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { deleted: true, deletedAt: new Date() },
      { new: true }
    );
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
