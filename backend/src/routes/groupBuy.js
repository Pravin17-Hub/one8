import express from 'express';
import { getActiveSessions, joinSession, getGroupBuyById } from '../controllers/groupBuyController.js';
import { authenticateToken, optionalAuthenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getActiveSessions);
router.get('/:id', optionalAuthenticateToken, getGroupBuyById);

router.use(authenticateToken);
router.post('/:sessionId/join', joinSession);

export default router;
