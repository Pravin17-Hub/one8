import express from 'express';
import { getActiveAuctions, placeBid, getAuctionById, getAuctionBids } from '../controllers/auctionController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getActiveAuctions);
router.get('/:id', getAuctionById);
router.get('/:id/bids', getAuctionBids);

router.use(authenticateToken);
router.post('/:id/bid', placeBid);

export default router;
