import { useState, useEffect } from 'react';
import { FiStar, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const EMPTY  = { name: '', role: '', company: '', message: '' };
const ERRORS = { name: '', role: '', company: '', message: '' };

// ── Validation rules ──────────────────────────────────────────────────────

const RULES = {
  name: {
    label: 'Name',
    min: 2, max: 50,
    pattern: /^[\p{L}\p{M} '-]+$/u,
    patternMsg: 'Only letters and spaces allowed.',
  },
  role: {
    label: 'Role',
    min: 2, max: 60,
    pattern: /^[\p{L}\p{M}\p{N} &.,'-]+$/u,
    patternMsg: 'Only letters, numbers and spaces allowed.',
  },
  company: {
    label: 'Company',
    min: 2, max: 100,
    pattern: /^[\p{L}\p{M}\p{N} &.,'-]+$/u,
    patternMsg: 'Only letters, numbers and spaces allowed.',
  },
  message: {
    label: 'Message',
    min: 20, max: 500,
    pattern: /^[\p{L}\p{M}\p{N} .,!?\-\n'"()@#%&*/:;]+$/u,
    patternMsg: 'Message contains unsupported characters.',
  },
};

// ── Injection detection (applied to every field) ──────────────────────────

const INJECTION_PATTERNS = [
  // XSS — HTML tags and event handlers
  { re: /<[a-z!][^>]*>/i,                         msg: 'HTML tags are not allowed.' },
  { re: /javascript\s*:/i,                         msg: 'JavaScript protocol not allowed.' },
  { re: /on\w+\s*=\s*/i,                           msg: 'Event handler attributes not allowed.' },
  { re: /data\s*:\s*text\s*\/\s*html/i,            msg: 'Data URI not allowed.' },
  // SQL — apostrophe followed by SQL operators/comments (catches: admin' --, ' OR, ' ;)
  { re: /'\s*(--|;|or\b|and\b|union\b|select\b|drop\b|insert\b|update\b|delete\b|exec\b)/i,
                                                    msg: 'Invalid input detected.' },
  // SQL comment sequences  -- at end of string OR followed by space
  { re: /--(\s|$)/,                                msg: 'Invalid input detected.' },
  // SQL block comment
  { re: /\/\*/,                                    msg: 'Invalid input detected.' },
  // SQL keywords after semicolons
  { re: /;\s*(drop|delete|insert|update|create|alter)\s+/i, msg: 'Invalid input detected.' },
  // UNION-based injection
  { re: /\bunion\s+(all\s+)?select\b/i,            msg: 'Invalid input detected.' },
  // Exec / stored procedures
  { re: /\bexec\s*\(/i,                            msg: 'Invalid input detected.' },
  // NoSQL injection
  { re: /\$where|\$gt|\$lt|\$ne|\$in\b|\$nin|\$regex|\$or\b|\$and\b/i, msg: 'Invalid input detected.' },
  { re: /\{\s*"\s*\$\w+"/,                         msg: 'Invalid input detected.' },
  // Command injection
  { re: /[;&|`]\s*(cat|ls|id|whoami|uname|curl|wget|bash|sh|python|perl|ruby|php)\b/i,
                                                    msg: 'Invalid input detected.' },
  { re: /\$\([^)]+\)/,                             msg: 'Invalid input detected.' },
  // Path traversal
  { re: /\.\.[/\\]/,                               msg: 'Path traversal not allowed.' },
  // Null byte
  { re: /\0/,                                      msg: 'Invalid characters detected.' },
];

function detectInjection(value) {
  for (const { re, msg } of INJECTION_PATTERNS) {
    if (re.test(value)) return msg;
  }
  return '';
}

function validateField(name, value) {
  const r   = RULES[name];
  const v   = value.trim();

  if (!v)                                      return `${r.label} is required.`;
  if (v.length < r.min)                        return `${r.label} must be at least ${r.min} characters.`;
  if (v.length > r.max)                        return `${r.label} must be ${r.max} characters or fewer.`;
  if (r.pattern && !r.pattern.test(v))         return r.patternMsg;

  const injectionErr = detectInjection(v);
  if (injectionErr)                            return injectionErr;

  return '';
}

function validateAll(form) {
  const errs = {};
  for (const key of Object.keys(RULES)) {
    errs[key] = validateField(key, form[key]);
  }
  return errs;
}

function isClean(errors) {
  return Object.values(errors).every(e => e === '');
}

// ── Sub-components ────────────────────────────────────────────────────────

function ErrorMsg({ msg }) {
  if (!msg) return null;
  return (
    <p className="flex items-center gap-1 font-mono text-xs text-red-400 mt-1.5">
      <FiAlertCircle size={11} className="flex-shrink-0" />
      {msg}
    </p>
  );
}

function InputField({ label, name, value, onChange, onBlur, error, touched, placeholder, type = 'text' }) {
  const dirty = touched && error;
  const ok    = touched && !error && value.trim().length > 0;
  return (
    <div>
      <label className="block font-mono text-xs text-gray-500 mb-1.5">
        <span className="text-primary">$</span> {label}
      </label>
      <div className="relative">
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          maxLength={RULES[name].max}
          className={`input pr-8 w-full transition-colors ${
            dirty ? 'border-red-500/60 focus:border-red-500'
                  : ok ? 'border-green-500/40' : ''
          }`}
        />
        {ok    && <FiCheckCircle size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400" />}
        {dirty && <FiAlertCircle size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400" />}
      </div>
      <ErrorMsg msg={dirty ? error : ''} />
    </div>
  );
}

// ── Main section ──────────────────────────────────────────────────────────

export default function TestimonialsSection() {
  const [list,      setList]      = useState([]);
  const [form,      setForm]      = useState(EMPTY);
  const [errors,    setErrors]    = useState(ERRORS);
  const [touched,   setTouched]   = useState(ERRORS);
  const [submitted, setSubmitted] = useState(false);
  const [loading,   setLoading]   = useState(false);

  useEffect(() => {
    api.get('/testimonials').then((r) => setList(r.data)).catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (touched[name]) {
      setErrors(er => ({ ...er, [name]: validateField(name, value) }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(t => ({ ...t, [name]: true }));
    setErrors(er => ({ ...er, [name]: validateField(name, value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark all fields touched and validate
    const allTouched = { name: true, role: true, company: true, message: true };
    setTouched(allTouched);
    const errs = validateAll(form);
    setErrors(errs);

    if (!isClean(errs)) {
      toast.error('Please fix the errors before submitting.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/testimonials', {
        name:    form.name.trim(),
        role:    form.role.trim(),
        company: form.company.trim(),
        message: form.message.trim(),
      });
      setSubmitted(true);
      setForm(EMPTY);
      setErrors(ERRORS);
      setTouched(ERRORS);
      toast.success('Testimonial submitted for review!');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const msgLen  = form.message.trim().length;
  const msgMax  = RULES.message.max;
  const msgMin  = RULES.message.min;
  const msgOver = msgLen > msgMax;

  return (
    <section id="testimonials" className="py-24 px-6 relative z-10">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="font-mono text-xs text-primary mb-2 tracking-widest">// 06. TESTIMONIALS</p>
          <h2 className="section-title">Testimonials</h2>
          <p className="section-subtitle">grep -r &quot;feedback&quot; /var/reviews/</p>
        </div>

        {/* Approved testimonials list */}
        {list.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {list.map((t) => (
              <div key={t._id} className="card">
                <div className="flex gap-1 mb-4">
                  {Array(5).fill(0).map((_, j) => (
                    <FiStar key={j} size={13} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="font-body text-sm text-gray-300 leading-relaxed italic mb-5">"{t.message}"</p>
                <div className="flex items-center gap-3 border-t border-border pt-4">
                  <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center font-display text-sm font-bold text-primary flex-shrink-0">
                    {t.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-display text-xs font-bold text-white">{t.name}</p>
                    <p className="font-mono text-xs text-gray-500">{t.role} @ {t.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center mb-16 py-12 card border-dashed border-border/50">
            <p className="font-mono text-sm text-gray-600">// No testimonials yet — be the first!</p>
          </div>
        )}

        {/* Submit form */}
        <div className="max-w-xl mx-auto">
          <h3 className="font-display text-base font-bold text-primary mb-6 text-center tracking-wide">
            Leave a Testimonial
          </h3>

          {submitted ? (
            <div className="card text-center py-10 border-green-500/30 bg-green-500/5">
              <div className="text-4xl mb-3">✅</div>
              <p className="font-mono text-sm text-green-400 mb-1">Submitted for review. Thank you!</p>
              <p className="font-mono text-xs text-gray-600">Your testimonial will appear once approved.</p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-5 font-mono text-xs text-primary hover:underline"
              >
                Submit another
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="card space-y-4" noValidate>
              <p className="font-mono text-xs text-gray-600 mb-2">
                <span className="text-primary">$</span> ./submit_testimonial.sh
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="name" name="name"
                  value={form.name} placeholder="Your Name"
                  onChange={handleChange} onBlur={handleBlur}
                  error={errors.name} touched={touched.name}
                />
                <InputField
                  label="role" name="role"
                  value={form.role} placeholder="Your Role / Title"
                  onChange={handleChange} onBlur={handleBlur}
                  error={errors.role} touched={touched.role}
                />
              </div>

              <InputField
                label="company" name="company"
                value={form.company} placeholder="Company / Organisation"
                onChange={handleChange} onBlur={handleBlur}
                error={errors.company} touched={touched.company}
              />

              <div>
                <label className="block font-mono text-xs text-gray-500 mb-1.5">
                  <span className="text-primary">$</span> message
                </label>
                <textarea
                  name="message"
                  rows={4}
                  value={form.message}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Share your experience working with Nitesh... (min 20 characters)"
                  maxLength={msgMax}
                  className={`input resize-none w-full transition-colors ${
                    touched.message && errors.message
                      ? 'border-red-500/60 focus:border-red-500'
                      : touched.message && !errors.message && msgLen >= msgMin
                        ? 'border-green-500/40'
                        : ''
                  }`}
                />
                <div className="flex items-start justify-between mt-1.5">
                  <ErrorMsg msg={touched.message ? errors.message : ''} />
                  <span className={`font-mono text-xs ml-auto flex-shrink-0 ${
                    msgOver      ? 'text-red-400' :
                    msgLen < msgMin ? 'text-gray-600'  : 'text-green-400/70'
                  }`}>
                    {msgLen}/{msgMax}
                  </span>
                </div>
              </div>

              {/* Honeypot — bots fill this, humans don't see it */}
              <input
                type="text"
                name="_trap"
                tabIndex={-1}
                autoComplete="off"
                style={{ display: 'none' }}
                aria-hidden="true"
              />

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full gap-2 disabled:opacity-50"
              >
                {loading ? '> submitting...' : '> submit_testimonial.sh'}
              </button>

              <p className="font-mono text-xs text-gray-700 text-center">
                Submissions are reviewed before appearing publicly.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
