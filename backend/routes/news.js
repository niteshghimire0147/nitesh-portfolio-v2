import express        from 'express';
import rateLimit      from 'express-rate-limit';

const router = express.Router();

const newsLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 min
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many news requests. Try again later.' },
});

// 10-minute in-memory cache
let cache = { data: null, at: 0 };
const CACHE_TTL_MS = 10 * 60 * 1000;

// GET /api/news
router.get('/', newsLimiter, async (req, res) => {
  try {
    const apiKey = process.env.NEWS_API_KEY;
    if (!apiKey) return res.status(200).json({ articles: [] });

    // Serve from cache if fresh
    if (cache.data && Date.now() - cache.at < CACHE_TTL_MS) {
      return res.json(cache.data);
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);

    const url = `https://newsapi.org/v2/everything?q=cybersecurity+penetration+testing&sortBy=publishedAt&pageSize=6&language=en&apiKey=${apiKey}`;
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);

    const data = await response.json();
    cache = { data, at: Date.now() };
    res.json(data);
  } catch (err) {
    if (err.name === 'AbortError') {
      return res.status(200).json({ articles: [] }); // upstream timeout — fail gracefully
    }
    res.status(200).json({ articles: [] });
  }
});

export default router;
