import express from 'express';
import {
  register,
  login,
  logout,
  refreshTokenHandler,
  getProfile,
  updateProfile,
  sendOtp,
  verifyOtp,
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh', refreshTokenHandler);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);

router.get('/profile', authenticateToken, getProfile);
router.get('/me', authenticateToken, getProfile);
router.patch('/profile', authenticateToken, updateProfile);

export default router;
