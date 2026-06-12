import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import cartRoutes from './routes/cart.js';
import orderRoutes from './routes/orders.js';
import aiRoutes from './routes/ai.js';
import sellerRoutes from './routes/seller.js';
import adminRoutes from './routes/admin.js';
import groupBuyRoutes from './routes/groupBuy.js';
import auctionRoutes from './routes/auctions.js';
import localSellersRoutes from './routes/localSellers.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5005;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/group-buy', groupBuyRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api/local-sellers', localSellersRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'One8 API is running' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
