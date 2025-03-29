require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

async function updateAdminPassword() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find the admin user
    const adminUser = await User.findOne({ email: 'admin@agrilink.com' });
    if (!adminUser) {
      console.log('Admin user not found');
      return;
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    // Update the password
    adminUser.password = hashedPassword;
    await adminUser.save();

    console.log('Admin password updated successfully');
    console.log('Email:', adminUser.email);
    console.log('Role:', adminUser.role);
    console.log('Status:', adminUser.status);

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
  }
}

updateAdminPassword(); 