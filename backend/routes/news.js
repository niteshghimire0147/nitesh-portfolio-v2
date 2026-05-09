import express   from 'express';
import rateLimit from 'express-rate-limit';
import Parser    from 'rss-parser';

const router = express.Router();
const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'media'],
      ['description',   'description'],
    ],
  },
});

const newsLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many news requests. Try again later.' },
});

// 15-minute in-memory cache
let cache = { data: null, at: 0 };
const CACHE_TTL_MS = 15 * 60 * 1000;

// Feed sources
const FEEDS = [
  { url: 'https://feeds.feedburner.com/TheHackersNews',          source: 'The Hacker News' },
  { url: 'https://www.paloaltonetworks.com/blog/feed/',           source: 'Palo Alto Networks' },
];

function stripHtml(str = '') {
  return str.replace(/<[^>]*>/g, '').trim();
}

function extractImg(html = '') {
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return m ? m[1] : '';
}

async function fetchFeed({ url, source }) {
  try {
    const feed = await parser.parseURL(url);
    return (feed.items || []).map((item) => ({
      title:       item.title       || '',
      link:        item.link        || '',
      pubDate:     item.pubDate     || item.isoDate || '',
      description: stripHtml(item.contentSnippet || item.description || '').slice(0, 300),
      thumbnail:   item.media?.['$']?.url
                   || item.enclosure?.url
                   || extractImg(item['content:encoded'] || item.description || ''),
      categories:  item.categories  || [],
      source,
    }));
  } catch (err) {
    console.error(`[NEWS] Failed to fetch ${source}:`, err.message);
    return [];
  }
}

// GET /api/news
router.get('/', newsLimiter, async (req, res) => {
  try {
    // Serve from cache if fresh
    if (cache.data && Date.now() - cache.at < CACHE_TTL_MS) {
      return res.json(cache.data);
    }

    // Fetch all feeds in parallel
    const results  = await Promise.all(FEEDS.map(fetchFeed));
    const combined = results.flat();

    // Sort by date descending (newest first)
    combined.sort((a, b) => {
      const da = a.pubDate ? new Date(a.pubDate).getTime() : 0;
      const db = b.pubDate ? new Date(b.pubDate).getTime() : 0;
      return db - da;
    });

    const payload = {
      articles:   combined,
      sources:    FEEDS.map((f) => f.source),
      fetchedAt:  new Date().toISOString(),
    };

    cache = { data: payload, at: Date.now() };
    res.json(payload);
  } catch (err) {
    console.error('[NEWS] Unexpected error:', err.message);
    if (cache.data) return res.json({ ...cache.data, stale: true });
    res.status(200).json({ articles: [], sources: [], error: 'Feed unavailable' });
  }
});

export default router;
