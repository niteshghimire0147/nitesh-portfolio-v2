import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import crypto from 'crypto';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import cookieParser from 'cookie-parser';

import authRoutes        from './routes/auth.js';
import uploadRoutes      from './routes/upload.js';
import githubRoutes      from './routes/github.js';
import blogRoutes        from './routes/blog.js';
import ctfRoutes         from './routes/ctf.js';
import projectRoutes     from './routes/projects.js';
import testimonialRoutes from './routes/testimonials.js';
import contactRoutes     from './routes/contact.js';
import newsRoutes        from './routes/news.js';
import siteConfigRoutes  from './routes/siteConfig.js';

import {
  blockBannedIPs,
  pathTraversalGuard,
  noSQLInjectionGuard,
  commandInjectionGuard,
  extraSecurityHeaders,
  requestID,
  sanitizeInputs,
} from './middleware/security.js';

dotenv.config();

// ── Production env validation ─────────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  const required = ['JWT_SECRET', 'MONGO_URI', 'CLIENT_URL', 'NEWS_API_KEY'];
  const missing  = required.filter(k => !process.env[k]);
  if (missing.length) {
    console.error(`❌  Missing required env vars in production: ${missing.join(', ')}`);
    process.exit(1);
  }
}

// ── Auto-generate secrets ─────────────────────────────────────────────────

if (!process.env.JWT_SECRET) {
  const generated = crypto.randomBytes(64).toString('hex');
  process.env.JWT_SECRET = generated;
  console.warn('⚠️  JWT_SECRET not set — auto-generated (add to .env to persist):');
  console.warn(`   JWT_SECRET=${generated}\n`);
}

// ── Rate limiters ─────────────────────────────────────────────────────────

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 min
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests — slow down.' },
  skip: (req) => req.path === '/api/health',
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,                      // 5 attempts per 15 min per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts. Try again in 15 minutes.' },
  keyGenerator: (req) =>
    (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
    req.socket?.remoteAddress || 'unknown',
});

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,   // 1 hour
  max: 5,
  message: { message: 'Too many contact form submissions.' },
});

// ── App setup ─────────────────────────────────────────────────────────────

const app = express();

// Trust proxy headers (needed on Railway / Render / Vercel)
app.set('trust proxy', 1);

// ── Security: layer 1 — always-on guards ─────────────────────────────────

app.use(requestID);
app.use(blockBannedIPs);
app.use(pathTraversalGuard);
app.use(commandInjectionGuard);
app.use(extraSecurityHeaders);

// ── Helmet — comprehensive security headers ───────────────────────────────

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc:      ["'self'"],
        scriptSrc:       ["'self'"],
        styleSrc:        ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc:         ["'self'", 'https://fonts.gstatic.com', 'data:'],
        imgSrc:          ["'self'", 'data:', 'https:'],
        connectSrc:      ["'self'", process.env.CLIENT_URL || 'http://localhost:5173'],
        frameAncestors:  ["'none'"],
        objectSrc:       ["'none'"],
        baseUri:         ["'self'"],
        formAction:      ["'self'"],
        upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    noSniff:         true,
    frameguard:      { action: 'deny' },
    xssFilter:       true,
    hidePoweredBy:   true,
    dnsPrefetchControl: { allow: false },
    crossOriginEmbedderPolicy: false, // relaxed to allow CDN fonts
  })
);

// ── CORS ──────────────────────────────────────────────────────────────────

app.use(cors({
  origin: (origin, cb) => {
    const base = (process.env.CLIENT_URL || '').replace(/\/$/, '');
    const allowed = [
      base,
      'https://niteshg.com.np',
      'http://niteshg.com.np',
      'http://localhost:5173',
      'http://localhost:3000',
    ].filter(Boolean);
    // LiteSpeed proxy can duplicate the Origin header — take first value only
    const firstOrigin = (origin || '').split(',')[0].trim();
    if (!firstOrigin || allowed.includes(firstOrigin)) return cb(null, true);
    process.stderr.write(`[CORS blocked] origin: ${origin}\n`);
    cb(new Error('CORS: origin not allowed'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['X-Request-ID'],
}));

// ── Cookie parsing ────────────────────────────────────────────────────────

app.use(cookieParser());

// ── Body parsing ──────────────────────────────────────────────────────────

app.use(express.json({ limit: '2mb' }));  // tightened from 10mb
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// ── MongoDB operator injection prevention ─────────────────────────────────

app.use(mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    console.warn(`[SEC] NoSQL injection key stripped: ${key} from ${req.ip}`);
  },
}));

// ── NoSQL + input sanitization (auth + contact only) ─────────────────────

app.use('/api/auth',    noSQLInjectionGuard, sanitizeInputs);
app.use('/api/contact', noSQLInjectionGuard, sanitizeInputs);

// ── Global rate limit ─────────────────────────────────────────────────────

app.use('/api', globalLimiter);

// ── Static uploads (no directory listing) ────────────────────────────────

app.use('/uploads', express.static('uploads', { index: false }));

// ── Routes ────────────────────────────────────────────────────────────────

// loginLimiter must be registered BEFORE the auth router so it actually fires
app.use('/api/auth/login',   loginLimiter);
app.use('/api/auth',         authRoutes);
app.use('/api/upload',       uploadRoutes);
app.use('/api/github',       githubRoutes);
app.use('/api/blogs',        blogRoutes);
app.use('/api/ctf',          ctfRoutes);
app.use('/api/projects',     projectRoutes);
app.use('/api/testimonials', noSQLInjectionGuard, sanitizeInputs, testimonialRoutes);
app.use('/api/contact',      noSQLInjectionGuard, sanitizeInputs, contactLimiter, contactRoutes);
app.use('/api/news',         newsRoutes);
app.use('/api/site-config',  siteConfigRoutes);

app.get('/api/health', (_req, res) =>
  res.json({ status: 'OK' })
);

// ── Sitemap ───────────────────────────────────────────────────────────────

app.get('/sitemap.xml', async (_req, res) => {
  try {
    const [Blog, CTF] = await Promise.all([
      (await import('./models/Blog.js')).default,
      (await import('./models/CTF.js')).default,
    ]);
    const [blogs, ctfs] = await Promise.all([
      Blog.find({ published: true, deleted: { $ne: true } }, 'slug updatedAt').lean(),
      CTF.find(  { published: true, deleted: { $ne: true } }, 'slug updatedAt').lean(),
    ]);

    const base = process.env.CLIENT_URL || 'https://niteshghimire.dev';
    const url = (path, date) =>
      `  <url><loc>${base}${path}</loc>${date ? `<lastmod>${new Date(date).toISOString().split('T')[0]}</lastmod>` : ''}</url>`;

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${url('/', null)}
${url('/blog', null)}
${url('/ctf', null)}
${blogs.map(b => url(`/blog/${b.slug}`, b.updatedAt)).join('\n')}
${ctfs.map(c  => url(`/ctf/${c.slug}`,  c.updatedAt)).join('\n')}
</urlset>`;

    res.header('Content-Type', 'application/xml').send(xml);
  } catch {
    res.status(500).send('Sitemap generation failed');
  }
});

// ── 404 for unknown API routes ────────────────────────────────────────────

app.use('/api/*', (_req, res) => {
  res.status(404).json({ message: 'Not found' });
});

// ── Global error handler (no stack traces in production) ─────────────────

app.use((err, _req, res, _next) => {
  const isProd = process.env.NODE_ENV === 'production';
  console.error('[ERR]', err.message);
  res.status(err.status || 500).json({
    message: isProd ? 'Internal server error' : err.message,
  });
});

// ── Start ─────────────────────────────────────────────────────────────────

mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/nitesh-portfolio')
  .then(() => {
    console.log('✅ MongoDB Connected');
    app.listen(process.env.PORT || 5000, () =>
      console.log(`🚀 Server on port ${process.env.PORT || 5000}`)
    );
  })
  .catch((err) => console.error('❌ MongoDB Error:', err));
