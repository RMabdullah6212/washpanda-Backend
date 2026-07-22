const cors = require('cors');

const configuredOrigins = process.env.CLIENT_URL || 'http://localhost:5173,http://localhost:5174';
const dashboardOrigin = process.env.DASHBOARD_URL || 'https://washpanda-dashboard.vercel.app';

const allowedOrigins = `${configuredOrigins},${dashboardOrigin}`
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

module.exports = cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    const error = new Error('Origin is not allowed by CORS');
    error.statusCode = 403;
    return callback(error);
  },
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
