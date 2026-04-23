require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const { hashPassword } = require('../utils/password');

const createTestUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Create individual test user
    const existingIndividual = await User.findOne({ email: 'test@test.com' });
    if (!existingIndividual) {
      const hashedPassword = await hashPassword('Test@123');
      await User.create({
        name: 'Test User',
        email: 'test@test.com',
        mobile: '1234567890',
        password: hashedPassword,
        address: 'Test Address',
        userType: 'individual',
        authProvider: 'email',
        active: true
      });
      console.log('✅ Individual user created');
      console.log('📧 Email: test@test.com');
      console.log('🔑 Password: Test@123');
    } else {
      console.log('⚠️  Individual user already exists');
    }

    // Create business test user
    const existingBusiness = await User.findOne({ email: 'business@test.com' });
    if (!existingBusiness) {
      const hashedPassword = await hashPassword('Test@123');
      await User.create({
        name: 'Business User',
        email: 'business@test.com',
        mobile: '9876543210',
        password: hashedPassword,
        address: 'Business Address',
        userType: 'business',
        authProvider: 'email',
        active: true
      });
      console.log('✅ Business user created');
      console.log('📧 Email: business@test.com');
      console.log('🔑 Password: Test@123');
    } else {
      console.log('⚠️  Business user already exists');
    }

    // Create admin if doesn't exist
    const existingAdmin = await User.findOne({ email: 'admin@closetrush.com' });
    if (!existingAdmin) {
      const hashedPassword = await hashPassword('Admin@123');
      await User.create({
        name: 'Admin User',
        email: 'admin@closetrush.com',
        mobile: '9999999999',
        password: hashedPassword,
        address: 'ClosetRush HQ',
        userType: 'admin',
        authProvider: 'email',
        active: true
      });
      console.log('✅ Admin user created');
      console.log('📧 Email: admin@closetrush.com');
      console.log('🔑 Password: Admin@123');
    } else {
      console.log('⚠️  Admin user already exists');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

createTestUser();
