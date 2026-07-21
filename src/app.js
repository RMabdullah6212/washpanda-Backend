const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDatabase = require('./config/database');
const corsMiddleware = require('./middleware/cors');
const { apiLimiter } = require('./middleware/rateLimiter');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const healthRoutes = require('./routes/healthRoutes');
const catalogRoutes = require('./routes/catalogRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const contactRoutes = require('./routes/contactRoutes');
const galleryRoutes = require('./routes/galleryRoutes');
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.disable('x-powered-by');
app.use(helmet());
app.use(corsMiddleware);
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false, limit: '100kb' }));
app.use(async (req, res, next) => {
  try {
    await connectDatabase(process.env.MONGODB_URI);
    next();
  } catch (error) {
    next(error);
  }
});
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use('/api', apiLimiter);

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'WashPanda API is running',
    documentation: '/api/health',
  });
});

app.use('/api/health', healthRoutes);
app.use('/api/catalog', catalogRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
