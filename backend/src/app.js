require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes = require('../modules/auth/auth.routes');
const sellerRoutes = require('../modules/sellers/seller.routes');
const categoryRoutes = require('../modules/categories/category.routes');
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

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});
app.use(passport.initialize());
app.use('/api/auth', authRoutes);
app.use('/api/sellers', sellerRoutes);
app.use('/api/categories', categoryRoutes);

module.exports = app;
