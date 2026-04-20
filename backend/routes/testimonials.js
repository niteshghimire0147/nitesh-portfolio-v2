import express      from 'express';
import mongoose      from 'mongoose';
import rateLimit     from 'express-rate-limit';
import Testimonial   from '../models/Testimonial.js';
import { protect }   from '../middleware/auth.js';

const router = express.Router();

// ── Rate limiter: max 3 submissions per IP per hour ───────────────────────
const submitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many testimonial submissions. Try again in an hour.' },
  keyGenerator: (req) =>
    (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
    req.socket?.remoteAddress || 'unknown',
});

// ── Validation rules ──────────────────────────────────────────────────────
// Unicode-aware allowlists — accept letters from any language, digits, common punctuation
const NAME_RE    = /^[\p{L}\p{M} '-]+$/u;
const ROLE_RE    = /^[\p{L}\p{M}\p{N} &.,'-]+$/u;
const COMPANY_RE = /^[\p{L}\p{M}\p{N} &.,'-]+$/u;
const MSG_RE     = /^[\p{L}\p{M}\p{N} .,!?\-\n'"()@#%&*/:;]+$/u;

// Simple blocklist — no catastrophic alternations, no \s* with many branches
const DANGEROUS_PATTERNS = [
  /<[a-z]/i,           // HTML tags
  /javascript:/i,      // JS protocol
  /on[a-z]+\s*=/i,    // event handlers
  /\$where/i,          // NoSQL
  /\bunion\b.{0,20}\bselect\b/i,  // SQLi (bounded lookahead)
  /\bexec\s*\(/i,      // SQL exec
  /\.\.[/\\]/,         // path traversal
  /\0/,                // null byte
];

function hasInjection(value) {
  return DANGEROUS_PATTERNS.some(re => re.test(value));
}

// Strip HTML tags from message before storage
function stripHtml(str) {
  return str.replace(/<[^>]+>/g, '').replace(/&[a-z]+;/gi, '').trim();
}

function validateTestimonial({ name, role, company, message }) {
  const errors = [];
  const n = (name    || '').trim();
  const r = (role    || '').trim();
  const c = (company || '').trim();
  const m = stripHtml((message || '').trim());

  if (!n)                          errors.push('Name is required.');
  else if (n.length < 2)           errors.push('Name must be at least 2 characters.');
  else if (n.length > 50)          errors.push('Name must be 50 characters or fewer.');
  else if (!NAME_RE.test(n))       errors.push('Name contains invalid characters.');
  else if (hasInjection(n))        errors.push('Invalid input in name.');

  if (!r)                          errors.push('Role is required.');
  else if (r.length < 2)           errors.push('Role must be at least 2 characters.');
  else if (r.length > 60)          errors.push('Role must be 60 characters or fewer.');
  else if (!ROLE_RE.test(r))       errors.push('Role contains invalid characters.');
  else if (hasInjection(r))        errors.push('Invalid input in role.');

  if (!c)                          errors.push('Company is required.');
  else if (c.length < 2)           errors.push('Company must be at least 2 characters.');
  else if (c.length > 100)         errors.push('Company must be 100 characters or fewer.');
  else if (!COMPANY_RE.test(c))    errors.push('Company contains invalid characters.');
  else if (hasInjection(c))        errors.push('Invalid input in company.');

  if (!m)                          errors.push('Message is required.');
  else if (m.length < 20)          errors.push('Message must be at least 20 characters.');
  else if (m.length > 500)         errors.push('Message must be 500 characters or fewer.');
  else if (!MSG_RE.test(m))        errors.push('Message contains invalid characters.');
  else if (hasInjection(m))        errors.push('Invalid input in message.');

  return { errors, clean: { name: n, role: r, company: c, message: m } };
}

// ── GET /api/testimonials  — approved only (public) ───────────────────────
router.get('/', async (_req, res) => {
  try {
    const testimonials = await Testimonial.find({ approved: true })
      .sort({ createdAt: -1 })
      .select('name role company message createdAt');
    res.json(testimonials);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── POST /api/testimonials  — public submission (pending approval) ─────────
router.post('/', submitLimiter, async (req, res) => {
  // Honeypot check — bots fill hidden _trap field
  if (req.body._trap) {
    return res.status(200).json({ message: 'Testimonial submitted for review' });
  }

  const { errors, clean } = validateTestimonial(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ message: errors[0] });
  }

  try {
    await Testimonial.create(clean);
    res.status(201).json({ message: 'Testimonial submitted for review' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── GET /api/testimonials/admin/all  — all (protected) ───────────────────
router.get('/admin/all', protect, async (_req, res) => {
  try {
    const all = await Testimonial.find().sort({ createdAt: -1 });
    res.json(all);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── PUT /api/testimonials/:id/approve  — (protected) ─────────────────────
router.put('/:id/approve', protect, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id))
    return res.status(400).json({ message: 'Invalid ID' });
  try {
    const t = await Testimonial.findByIdAndUpdate(
      req.params.id,
      { approved: true },
      { new: true }
    );
    if (!t) return res.status(404).json({ message: 'Testimonial not found' });
    res.json(t);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── DELETE /api/testimonials/:id  — (protected) ───────────────────────────
router.delete('/:id', protect, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id))
    return res.status(400).json({ message: 'Invalid ID' });
  try {
    await Testimonial.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
