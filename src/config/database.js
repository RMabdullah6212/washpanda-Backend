const mongoose = require('mongoose');

let connectionPromise;
let listenersAttached = false;

async function connectDatabase(uri) {
  if (!uri) throw new Error('MONGODB_URI is required');

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!listenersAttached) {
    mongoose.connection.on('connected', () => {
      console.log('MongoDB connected');
    });

    mongoose.connection.on('error', (error) => {
      console.error('MongoDB connection error:', error.message);
    });

    listenersAttached = true;
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(uri).catch((error) => {
      connectionPromise = undefined;
      throw error;
    });
  }

  await connectionPromise;
  return mongoose.connection;
}

module.exports = connectDatabase;
