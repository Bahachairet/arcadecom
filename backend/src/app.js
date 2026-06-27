require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');

const authRoutes = require('../modules/auth/auth.routes');
const sellerRoutes = require('../modules/sellers/seller.routes');
const categoryRoutes = require('../modules/categories/category.routes');
const productRoutes = require('../modules/products/product.routes');
const cartRoutes = require('../modules/cart/cart.routes');
const orderRoutes = require('../modules/orders/order.routes');
const reviewRoutes = require('../modules/reviews/review.routes');
const conversationRoutes = require('../modules/conversations/conversation.routes');
const messageRoutes = require('../modules/messages/message.routes');
const bidProductRoutes = require('../modules/bidproducts/bidproduct.routes');
const bidRoutes = require('../modules/bids/bid.routes');
const bidProductReviewRoutes = require('../modules/bidproduct-reviews/bidproduct-review.routes');
const statsRoutes = require('../modules/stats/stats.routes');
const userRoutes = require('../modules/users/user.routes');
const passport = require(
  "../config/passport"
);

const app = express();

app.use(express.json());

app.use(cookieParser());

app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  }),
);

app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});
app.use(passport.initialize());
app.use('/api/auth', authRoutes);
app.use('/api/sellers', sellerRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/bidproducts', bidProductRoutes);
app.use('/api/bids', bidRoutes);
app.use('/api/bidproduct-reviews', bidProductReviewRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/users', userRoutes);

module.exports = app;
