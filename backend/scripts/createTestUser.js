require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

async function createTestUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create test farmer account
    const hashedPassword = await bcrypt.hash('test123', 10);
    const user = new User({
      name: 'Test Farmer 2',
      email: 'farmer2@test.com',
      password: hashedPassword,
      role: 'farmer'
    });

    await user.save();
    console.log('Test farmer account created successfully');
    console.log('Email: farmer2@test.com');
    console.log('Password: test123');
    console.log('Role: farmer');

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
  }
}

createTestUser(); 