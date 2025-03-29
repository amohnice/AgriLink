require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function checkAdminUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const adminUser = await User.findOne({ email: 'admin@agrilink.com' });
    if (adminUser) {
      console.log('Admin user found:');
      console.log('Name:', adminUser.name);
      console.log('Email:', adminUser.email);
      console.log('Role:', adminUser.role);
      console.log('Status:', adminUser.status);
      console.log('Is Approved:', adminUser.isApproved);
    } else {
      console.log('Admin user not found');
    }

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
  }
}

checkAdminUser(); 