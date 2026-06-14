import express from 'express';
import { getActiveSessions, joinSession, getGroupBuyById, createGroupBuy, completeGroupBuy } from '../controllers/groupBuyController.js';
import { authenticateToken, optionalAuthenticateToken } from '../middleware/auth.js';
import { isAdmin } from '../middleware/role.js';

const router = express.Router();

// Public
router.get('/', getActiveSessions);
router.get('/:id', optionalAuthenticateToken, getGroupBuyById);

// Admin-only creation/completion
router.post('/', authenticateToken, isAdmin, createGroupBuy);
router.post('/:id/complete', authenticateToken, isAdmin, completeGroupBuy);

// Customer-only join
router.post('/:sessionId/join', authenticateToken, joinSession);

export default router;
