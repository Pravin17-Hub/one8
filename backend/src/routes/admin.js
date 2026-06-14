import express from 'express';
import { getAdminStats, getPlatformUsers, getSystemHealth, getAllAuctions, getAllGroupBuys, getAllProductsAdmin, getAllOrdersAdmin, updateOrderStatusAdmin } from '../controllers/adminController.js';
import { authenticateToken } from '../middleware/auth.js';
import { isAdmin } from '../middleware/role.js';

const router = express.Router();

// All routes require ADMIN role
router.use(authenticateToken, isAdmin);

router.get('/stats', getAdminStats);
router.get('/users', getPlatformUsers);
router.get('/system-health', getSystemHealth);
router.get('/auctions', getAllAuctions);
router.get('/group-buys', getAllGroupBuys);
router.get('/products', getAllProductsAdmin);
router.get('/orders', getAllOrdersAdmin);
router.put('/orders/:id/status', updateOrderStatusAdmin);

export default router;
