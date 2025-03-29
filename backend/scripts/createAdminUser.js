require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

async function createAdminUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create admin account
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const user = new User({
      name: 'Admin User',
      email: 'admin@agrilink.com',
      password: hashedPassword,
      role: 'admin',
      isApproved: true,
      status: 'active'
    });

    await user.save();
    console.log('Admin account created successfully');
    console.log('Email: admin@agrilink.com');
    console.log('Password: admin123');
    console.log('Role: admin');

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
  }
}

createAdminUser(); 