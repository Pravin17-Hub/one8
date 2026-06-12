import express from 'express';
import { getAdminStats, getPlatformUsers, getSystemHealth } from '../controllers/adminController.js';
import { authenticateToken } from '../middleware/auth.js';
import { isAdmin } from '../middleware/role.js';

const router = express.Router();

// All routes require ADMIN role
router.use(authenticateToken, isAdmin);

router.get('/stats', getAdminStats);
router.get('/users', getPlatformUsers);
router.get('/system-health', getSystemHealth);

export default router;
