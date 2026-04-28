import express    from 'express';
import rateLimit  from 'express-rate-limit';

const router = express.Router();

const GITHUB_USER = 'niteshghimire0147';
const CACHE_TTL   = 10 * 60 * 1000; // 10 minutes

let cache = { data: null, ts: 0 };

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { message: 'Too many requests.' },
});

// GET /api/github/repos
router.get('/repos', limiter, async (_req, res) => {
  // Serve from cache if still fresh
  if (cache.data && Date.now() - cache.ts < CACHE_TTL) {
    return res.json(cache.data);
  }

  try {
    const r = await fetch(
      `https://api.github.com/users/${GITHUB_USER}/repos?sort=updated&per_page=30`,
      {
        headers: {
          'User-Agent': 'nitesh-portfolio-server',
          'Accept':     'application/vnd.github.v3+json',
        },
      }
    );

    if (!r.ok) {
      // If rate limited but we have stale cache, serve it
      if (cache.data) return res.json(cache.data);
      return res.json([]);
    }

    const repos = await r.json();
    cache = { data: repos, ts: Date.now() };
    res.json(repos);
  } catch {
    // Network error — serve stale cache or empty
    res.json(cache.data || []);
  }
});

export default router;
