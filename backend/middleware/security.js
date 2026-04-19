import crypto from 'crypto';
import { sendSecurityAlert } from '../utils/mailer.js';

// ── In-memory stores (use Redis in multi-instance prod) ───────────────────
const traversalAttempts = new Map(); // ip -> { count, ts }
const blockedIPs        = new Map(); // ip -> blockedUntil (ms)

const BLOCK_DURATION_MS  = 24 * 60 * 60 * 1000; // 24 h
const ATTEMPT_TTL_MS     = 60 * 60 * 1000;       // reset attempt counter after 1 h idle
const MAX_TRAVERSAL      = 3;

const MAP_SIZE_LIMIT = 50_000; // hard cap — evict oldest if exceeded

// Prune stale entries every 30 minutes to prevent memory growth
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of traversalAttempts) {
    if (now - entry.ts > ATTEMPT_TTL_MS) traversalAttempts.delete(ip);
  }
  for (const [ip, until] of blockedIPs) {
    if (now > until) { blockedIPs.delete(ip); traversalAttempts.delete(ip); }
  }
  // Evict oldest entries if maps exceed size limit (handles DDoS with many IPs)
  if (traversalAttempts.size > MAP_SIZE_LIMIT) {
    const keep = [...traversalAttempts.entries()]
      .sort((a, b) => b[1].ts - a[1].ts)
      .slice(0, MAP_SIZE_LIMIT / 2);
    traversalAttempts.clear();
    for (const [k, v] of keep) traversalAttempts.set(k, v);
  }
}, 30 * 60 * 1000).unref();

// ── Helpers ───────────────────────────────────────────────────────────────

function getIP(req) {
  return (
    (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
    req.headers['x-real-ip'] ||
    req.socket?.remoteAddress ||
    'unknown'
  );
}

function isBlocked(ip) {
  if (!blockedIPs.has(ip)) return false;
  if (Date.now() < blockedIPs.get(ip)) return true;
  blockedIPs.delete(ip);
  traversalAttempts.delete(ip);
  return false;
}

function recordAttempt(ip) {
  const count = (traversalAttempts.get(ip)?.count || 0) + 1;
  traversalAttempts.set(ip, { count, ts: Date.now() });
  if (count >= MAX_TRAVERSAL) {
    blockedIPs.set(ip, Date.now() + BLOCK_DURATION_MS);
    console.warn(`[SEC] IP BLOCKED after ${count} attempts: ${ip}`);
    sendSecurityAlert(
      `IP Blocked: ${ip}`,
      `IP ${ip} was blocked for 24 hours after ${count} path traversal attempts.\nTime: ${new Date().toISOString()}`
    );
    return true; // newly blocked
  }
  console.warn(`[SEC] Traversal attempt ${count}/${MAX_TRAVERSAL} from ${ip}`);
  return false;
}

// ── Pattern libraries ─────────────────────────────────────────────────────

const TRAVERSAL_RE = [
  /\.\.[/\\]/,               // ../  ..\
  /\.\.%2f/i,                // URL-encoded ../
  /\.\.%5c/i,                // URL-encoded ..\
  /%2e%2e/i,                 // %2e%2e
  /%252e/i,                  // double-encoded .
  /\0/,                      // null byte
  /\/etc\/(passwd|shadow|hosts|group|crontab)/i,
  /\/proc\/self/i,
  /\/var\/www/i,
  /\/root\//i,
  /\.ssh\/(id_rsa|authorized)/i,
  /file:\/\//i,              // file:// wrapper
  /(?:php|expect|data|glob|zip|phar):\/\//i, // PHP/stream wrappers
];

const NOSQL_RE = [
  /\$where/i,
  /\$gt|\$lt|\$ne|\$in|\$nin|\$or|\$and|\$not|\$nor/,
  /\$regex/i,
  /\$elemMatch/i,
];

const CMD_RE = [
  /[;&|`]\s*(?:cat|ls|id|whoami|uname|curl|wget|bash|sh|python|perl|ruby|php)\b/i,
  /\$\(.*\)/,                // command substitution
  /`[^`]+`/,                 // backtick execution
];

function testPatterns(str, patterns) {
  return patterns.some(p => p.test(str));
}

function flattenRequest(req) {
  const parts = [
    decodeURIComponent(req.path || ''),
    JSON.stringify(req.query  || {}),
    JSON.stringify(req.params || {}),
  ];
  if (req.body && typeof req.body === 'object') parts.push(JSON.stringify(req.body));
  else if (typeof req.body === 'string')         parts.push(req.body);
  return parts.join(' ');
}

// ── Exported middleware ───────────────────────────────────────────────────

/** Block IPs that have been flagged — always first in chain */
export function blockBannedIPs(req, res, next) {
  const ip = getIP(req);
  if (isBlocked(ip)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
}

/** Detect & block path/file traversal + stream-wrapper abuse */
export function pathTraversalGuard(req, res, next) {
  const ip  = getIP(req);
  const str = flattenRequest(req);

  if (testPatterns(str, TRAVERSAL_RE)) {
    const justBlocked = recordAttempt(ip);
    return res.status(justBlocked ? 403 : 400).json({ message: 'Forbidden' });
  }
  next();
}

/** Detect NoSQL injection patterns in request body */
export function noSQLInjectionGuard(req, res, next) {
  const ip  = getIP(req);
  const str = JSON.stringify(req.body || {});

  if (testPatterns(str, NOSQL_RE)) {
    console.warn(`[SEC] NoSQL injection attempt from ${ip}`);
    return res.status(400).json({ message: 'Bad request' });
  }
  next();
}

/** Detect OS command injection patterns */
export function commandInjectionGuard(req, res, next) {
  const ip  = getIP(req);
  const str = flattenRequest(req);

  if (testPatterns(str, CMD_RE)) {
    console.warn(`[SEC] Command injection attempt from ${ip}`);
    recordAttempt(ip);
    return res.status(400).json({ message: 'Bad request' });
  }
  next();
}

/** Add security headers not covered by helmet */
export function extraSecurityHeaders(_req, res, next) {
  res.setHeader('X-Content-Type-Options',            'nosniff');
  res.setHeader('X-Frame-Options',                   'DENY');
  res.setHeader('X-XSS-Protection',                  '0');  // CSP handles XSS now
  res.setHeader('Referrer-Policy',                   'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy',                'camera=(), microphone=(), geolocation=(), payment=()');
  res.setHeader('Cross-Origin-Opener-Policy',        'same-origin');
  res.setHeader('Cross-Origin-Resource-Policy',      'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy',      'require-corp');
  res.removeHeader('X-Powered-By');
  res.removeHeader('Server');
  next();
}

/** Request ID — every response gets a unique trace ID */
export function requestID(req, res, next) {
  const id = crypto.randomBytes(8).toString('hex');
  req.id = id;
  res.setHeader('X-Request-ID', id);
  next();
}

/** Sanitize strings in req.body recursively (strip HTML tags, trim) */
function sanitizeValue(v) {
  if (typeof v === 'string') {
    return v
      .replace(/<[^>]+>/g, '')       // strip HTML tags
      .replace(/javascript:/gi, '')   // strip js: proto
      .trim();
  }
  if (Array.isArray(v))              return v.map(sanitizeValue);
  if (v && typeof v === 'object')    return sanitizeObject(v);
  return v;
}

function sanitizeObject(obj) {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    // strip Mongo operators from keys
    if (k.startsWith('$')) continue;
    out[k] = sanitizeValue(v);
  }
  return out;
}

/** Apply to auth + contact routes only (not CMS content) */
export function sanitizeInputs(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  next();
}
