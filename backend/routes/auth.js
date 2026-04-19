import express from 'express';
import {
  login, logout, getMe,
  setup2FA, enable2FA, disable2FA, validate2FA,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/login',        login);
router.post('/logout',       logout);
router.get('/me',            protect, getMe);

// 2FA routes
router.post('/2fa/validate', validate2FA);          // login step 2 (no auth required)
router.post('/2fa/setup',    protect, setup2FA);    // generate QR code
router.post('/2fa/enable',   protect, enable2FA);   // confirm & activate
router.post('/2fa/disable',  protect, disable2FA);  // deactivate

export default router;
