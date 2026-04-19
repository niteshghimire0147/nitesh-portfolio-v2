import express from 'express';
import Project from '../models/Project.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const SAFE_URL_RE = /^https?:\/\/.+/i;

function sanitizeUrl(url) {
  if (!url) return '';
  const u = String(url).trim();
  return SAFE_URL_RE.test(u) ? u : '';
}

function pickProjectFields(body) {
  const { title, description, techStack, category, githubUrl, liveUrl, image, featured, order } = body;
  return {
    title, description, techStack, category,
    githubUrl: sanitizeUrl(githubUrl),
    liveUrl:   sanitizeUrl(liveUrl),
    image:     sanitizeUrl(image),
    featured, order,
  };
}

// GET /api/projects
router.get('/', async (req, res) => {
  try {
    const { category, page = 1, limit = 50 } = req.query;
    const safeLimit = Math.min(Math.max(parseInt(limit) || 50, 1), 100);
    const safePage  = Math.max(parseInt(page) || 1, 1);
    const filter    = { deleted: { $ne: true } };
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
