require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const { hashPassword } = require('../utils/password');

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@closetrush.com' });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log('📧 Email: admin@closetrush.com');
      process.exit(0);
    }

    // Create admin user
    const hashedPassword = await hashPassword('Admin@123');
    
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@closetrush.com',
      mobile: '9999999999',
      password: hashedPassword,
      address: 'ClosetRush HQ',
      userType: 'admin',
      authProvider: 'email',
      active: true 
    });

    console.log('✅ Admin user created successfully!');
    console.log('');
    console.log('📧 Email: admin@closetrush.com');
    console.log('🔑 Password: Admin@123');
    console.log('📱 Mobile: 9999999999');
    console.log('');
    console.log('⚠️  IMPORTANT: Change the password after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    process.exit(1);
  }
};

createAdmin();
