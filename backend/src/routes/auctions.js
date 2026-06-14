import express from 'express';
import { getActiveAuctions, placeBid, getAuctionById, getAuctionBids, createAuction, completeAuction } from '../controllers/auctionController.js';
import { authenticateToken } from '../middleware/auth.js';
import { isAdmin } from '../middleware/role.js';

const router = express.Router();

// Public
router.get('/', getActiveAuctions);
router.get('/:id', getAuctionById);
router.get('/:id/bids', getAuctionBids);

// Admin-only creation/completion
router.post('/', authenticateToken, isAdmin, createAuction);
router.post('/:id/complete', authenticateToken, isAdmin, completeAuction);

// Customer-only bids
router.post('/:id/bid', authenticateToken, placeBid);

export default router;
