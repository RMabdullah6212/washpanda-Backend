require('dotenv').config();

const mongoose = require('mongoose');
const app = require('./app');
const connectDatabase = require('./config/database');

const port = Number(process.env.PORT) || 5000;
const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  console.error('MONGODB_URI is required. Copy .env.example to .env and configure it.');
  process.exit(1);
}

async function startServer() {
  try {
    await connectDatabase(mongoUri);

    const server = app.listen(port, () => {
      console.log(`WashPanda API running at http://localhost:${port}`);
    });

    async function shutdown(signal) {
      console.log(`${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        await mongoose.connection.close();
        process.exit(0);
      });
    }

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.error('Unable to start server:', error.message);
    process.exit(1);
  }
}

startServer();
