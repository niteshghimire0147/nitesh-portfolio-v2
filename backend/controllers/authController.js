import jwt       from 'jsonwebtoken';
import speakeasy  from 'speakeasy';
import QRCode     from 'qrcode';
import User       from '../models/User.js';
import { sendSecurityAlert }  from '../utils/mailer.js';
import { logSecurityEvent }   from '../utils/securityLogger.js';

// Password must be 8-128 chars with at least one uppercase, lowercase, and digit
const PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,128}$/;

// ── Cookie config ─────────────────────────────────────────────────────────

const COOKIE_OPTS = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge:   7 * 24 * 60 * 60 * 1000, // 7 days
  path:     '/',
};

// ── Token helpers ─────────────────────────────────────────────────────────

// Pin HS256 — prevents algorithm confusion attacks (alg:none, RS256 swap)
const makeToken = (payload, expiresIn) =>
  jwt.sign(payload, process.env.JWT_SECRET, { algorithm: 'HS256', expiresIn });

const setAuthCookie = (res, userId) => {
  const token = makeToken({ id: userId }, '7d');
  res.cookie('token', token, COOKIE_OPTS);
  return token;
};

// ── Login failure tracking ────────────────────────────────────────────────

const loginFailures    = new Map(); // ip -> { count, ts }
const ALERT_THRESHOLD  = 3;
const FAILURE_TTL_MS   = 15 * 60 * 1000; // reset after 15 min idle

setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of loginFailures) {
    if (now - entry.ts > FAILURE_TTL_MS) loginFailures.delete(ip);
  }
}, 5 * 60 * 1000).unref();

function getIP(req) {
  return (
    (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
    req.socket?.remoteAddress || 'unknown'
  );
}

function trackFailure(ip, username) {
  const prev  = loginFailures.get(ip) || { count: 0 };
  const count = prev.count + 1;
  loginFailures.set(ip, { count, ts: Date.now() });

  if (count === ALERT_THRESHOLD) {
    sendSecurityAlert(
      `Login brute-force attempt: ${ip}`,
      `IP: ${ip}\nUsername tried: ${username}\nFailed attempts: ${count}\nTime: ${new Date().toISOString()}`
    );
  }
}

function clearFailures(ip) {
  loginFailures.delete(ip);
}

// ── POST /api/auth/login ──────────────────────────────────────────────────

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const ip = getIP(req);

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password required' });
    }

    // Max-length guard
    if (username.length > 50 || password.length > 128) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const user = await User.findOne({ username });
    if (!user || !(await user.matchPassword(password))) {
      trackFailure(ip, username);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    clearFailures(ip);

    // If 2FA is enabled, issue a short-lived temp token instead of setting cookie
    if (user.twoFactorEnabled) {
      const tempToken = makeToken({ id: user._id, step: '2fa' }, '5m');
      return res.json({ require2FA: true, tempToken });
    }

    setAuthCookie(res, user._id);
    return res.json({ username: user.username, twoFactorEnabled: false });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ── POST /api/auth/logout ─────────────────────────────────────────────────

export const logout = (_req, res) => {
  res.clearCookie('token', { ...COOKIE_OPTS, maxAge: 0 });
  res.json({ message: 'Logged out' });
};

// ── GET /api/auth/me ──────────────────────────────────────────────────────

export const getMe = async (req, res) => {
  try {
    const user = await User
      .findById(req.user.id)
      .select('-password -twoFactorSecret -twoFactorPendingSecret');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ── POST /api/auth/2fa/validate (login step 2) ────────────────────────────

export const validate2FA = async (req, res) => {
  try {
    const { tempToken, totpCode } = req.body;
    if (!tempToken || !totpCode) {
      return res.status(400).json({ message: 'Token and TOTP code required' });
    }

    let decoded;
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ message: 'Session expired. Please log in again.' });
    }

    if (decoded.step !== '2fa') {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const user = await User.findById(decoded.id);
    if (!user?.twoFactorEnabled || !user.twoFactorSecret) {
      return res.status(400).json({ message: '2FA not configured' });
    }

    const valid = speakeasy.totp.verify({
      secret:   user.twoFactorSecret,
      encoding: 'base32',
      token:    totpCode.replace(/\s/g, ''),
      window:   1,
    });

    if (!valid) {
      const ip = getIP(req);
      sendSecurityAlert('Failed 2FA attempt', `IP: ${ip}\nUser: ${user.username}\nTime: ${new Date().toISOString()}`);
      return res.status(401).json({ message: 'Invalid authenticator code' });
    }

    setAuthCookie(res, user._id);
    return res.json({ username: user.username, twoFactorEnabled: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ── POST /api/auth/2fa/setup (generate QR) ───────────────────────────────

export const setup2FA = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.twoFactorEnabled) {
      return res.status(400).json({ message: '2FA is already enabled' });
    }

    const secret = speakeasy.generateSecret({
      name:   `Nitesh Portfolio CMS (${user.username})`,
      length: 32,
    });

    // Store pending secret (not yet enabled until confirmed)
    user.twoFactorPendingSecret = secret.base32;
    await user.save();

    const qrDataUrl = await QRCode.toDataURL(secret.otpauth_url);

    res.json({
      qrDataUrl,
      manualKey: secret.base32,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ── POST /api/auth/2fa/enable (confirm TOTP to activate) ─────────────────

export const enable2FA = async (req, res) => {
  try {
    const { totpCode } = req.body;
    if (!totpCode) return res.status(400).json({ message: 'TOTP code required' });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.twoFactorPendingSecret) {
      return res.status(400).json({ message: 'No pending 2FA setup. Start setup first.' });
    }

    const valid = speakeasy.totp.verify({
      secret:   user.twoFactorPendingSecret,
      encoding: 'base32',
      token:    totpCode.replace(/\s/g, ''),
      window:   1,
    });

    if (!valid) return res.status(401).json({ message: 'Invalid code. Try again.' });

    user.twoFactorSecret        = user.twoFactorPendingSecret;
    user.twoFactorPendingSecret = null;
    user.twoFactorEnabled       = true;
    await user.save();

    res.json({ message: '2FA enabled successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ── POST /api/auth/2fa/disable ────────────────────────────────────────────

export const disable2FA = async (req, res) => {
  try {
    const { totpCode } = req.body;
    if (!totpCode) return res.status(400).json({ message: 'TOTP code required to disable 2FA' });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.twoFactorEnabled) {
      return res.status(400).json({ message: '2FA is not enabled' });
    }

    const valid = speakeasy.totp.verify({
      secret:   user.twoFactorSecret,
      encoding: 'base32',
      token:    totpCode.replace(/\s/g, ''),
      window:   1,
    });

    if (!valid) return res.status(401).json({ message: 'Invalid authenticator code' });

    user.twoFactorEnabled = false;
    user.twoFactorSecret  = null;
    await user.save();

    res.json({ message: '2FA disabled' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
