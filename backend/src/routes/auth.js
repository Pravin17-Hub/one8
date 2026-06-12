import express from 'express';
import {
  register,
  login,
  logout,
  refreshTokenHandler,
  getProfile,
  updateProfile,
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh', refreshTokenHandler);

router.get('/profile', authenticateToken, getProfile);
router.get('/me', authenticateToken, getProfile);
router.patch('/profile', authenticateToken, updateProfile);

export default router;
