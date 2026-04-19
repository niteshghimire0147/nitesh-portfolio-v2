import express    from 'express';
import SiteConfig  from '../models/SiteConfig.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Only these top-level keys are allowed in PUT — prevents arbitrary field injection
const ALLOWED_KEYS = new Set([
  'about', 'skills', 'experience', 'certifications',
  'contact', 'customNews', 'hallOfFame', 'arsenal',
]);

// GET /api/site-config  — public
router.get('/', async (_req, res) => {
  try {
    let config = await SiteConfig.findOne().lean();
    if (!config) config = await SiteConfig.create({});
    res.json(config);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/site-config  — protected, partial section updates with whitelist
router.put('/', protect, async (req, res) => {
  try {
    const setPayload = {};
    for (const key of Object.keys(req.body)) {
      if (!ALLOWED_KEYS.has(key)) continue; // silently drop unknown keys
      setPayload[key] = req.body[key];
    }

    if (Object.keys(setPayload).length === 0) {
      return res.status(400).json({ message: 'No valid fields provided.' });
    }

    const config = await SiteConfig.findOneAndUpdate(
      {},
      { $set: setPayload },
      { new: true, upsert: true, runValidators: true }
    );
    res.json(config);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
