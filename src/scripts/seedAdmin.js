require('dotenv').config();

const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const connectDatabase = require('../config/database');
const Admin = require('../models/Admin');

async function seedAdmin() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) throw new Error('MONGODB_URI is required');

  const email = (process.env.INITIAL_ADMIN_EMAIL || 'admin@example.com').toLowerCase();
  const password = process.env.INITIAL_ADMIN_PASSWORD || 'Admin@123';
  const fullName = process.env.INITIAL_ADMIN_NAME || 'WashPanda Admin';

  await connectDatabase(mongoUri);

  const existingAdmin = await Admin.exists({ email });
  if (existingAdmin) {
    console.log(`Admin already exists: ${email}`);
    return;
  }

  await Admin.create({
    fullName,
    email,
    passwordHash: await bcrypt.hash(password, 12),
  });
  console.log(`Initial admin created: ${email}`);
}

seedAdmin()
  .catch((error) => {
    console.error('Admin seed failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
