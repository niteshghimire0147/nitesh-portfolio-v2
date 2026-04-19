import jwt  from 'jsonwebtoken';
import User from '../models/User.js';
import { logSecurityEvent } from '../utils/securityLogger.js';

export const protect = async (req, res, next) => {
  // Read token from httpOnly cookie first, fall back to Authorization header
  let token = req.cookies?.token;
  if (!token) {
    const h = req.headers.authorization;
    if (h?.startsWith('Bearer ')) token = h.split(' ')[1];
  }
  if (!token) return res.status(401).json({ message: 'Not authorized' });

  try {
    // Pin algorithm — prevents alg:none / confusion attacks
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });

    // Reject temp 2FA tokens
    if (decoded.step === '2fa') return res.status(401).json({ message: 'Not authorized' });

    // Verify user still exists in DB (revocation check)
    const user = await User.findById(decoded.id).select('_id twoFactorEnabled').lean();
    if (!user) {
      logSecurityEvent('ORPHAN_TOKEN', { userId: decoded.id });
      return res.status(401).json({ message: 'Not authorized' });
    }

    req.user = decoded;
    next();
  } catch (err) {
    logSecurityEvent('INVALID_TOKEN', { error: err.message });
    return res.status(401).json({ message: 'Not authorized, token invalid' });
  }
};
