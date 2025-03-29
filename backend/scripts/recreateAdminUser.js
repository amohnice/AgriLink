require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function recreateAdminUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Delete existing admin user
    await User.deleteOne({ email: 'admin@agrilink.com' });
    console.log('Deleted existing admin user');

    // Create new admin user - password will be hashed by the model's pre-save middleware
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@agrilink.com',
      password: 'admin123', // Plain password - will be hashed by the model
      role: 'admin',
      isApproved: true,
      status: 'active'
    });

    await adminUser.save();
    console.log('Admin user recreated successfully');
    console.log('Email:', adminUser.email);
    console.log('Role:', adminUser.role);
    console.log('Status:', adminUser.status);

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
  }
}

recreateAdminUser(); 