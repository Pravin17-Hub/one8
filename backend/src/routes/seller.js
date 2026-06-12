import express from 'express';
import { getDashboardStats, getSellerProducts, getSellerOrders } from '../controllers/sellerController.js';
import { authenticateToken } from '../middleware/auth.js';
import { isSeller } from '../middleware/role.js';

const router = express.Router();

// All routes are protected and require SELLER role
router.use(authenticateToken, isSeller);

router.get('/stats', getDashboardStats);
router.get('/products', getSellerProducts);
router.get('/orders', getSellerOrders);

export default router;
