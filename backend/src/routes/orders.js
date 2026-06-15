import express from 'express';
import { checkout, getMyOrders, getOrderById, payOrder } from '../controllers/orderController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/checkout', checkout);
router.post('/:id/pay', payOrder);
router.get('/my-orders', getMyOrders);
router.get('/:id', getOrderById);

export default router;
