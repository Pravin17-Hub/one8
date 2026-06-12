import express from 'express';
import { getLocalSellers } from '../controllers/localSellersController.js';

const router = express.Router();

router.get('/', getLocalSellers);

export default router;
