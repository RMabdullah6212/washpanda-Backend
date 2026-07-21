const mongoose = require('mongoose');

async function connectDatabase(uri) {
  mongoose.connection.on('connected', () => {
    console.log('MongoDB connected');
  });

  mongoose.connection.on('error', (error) => {
    console.error('MongoDB connection error:', error.message);
  });

  await mongoose.connect(uri);
}

module.exports = connectDatabase;
