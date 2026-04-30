/**
 * Test script to verify minimum duration calculation
 */

const mongoose = require('mongoose');
const Bundle = require('../models/Bundle');
const Category = require('../models/Category');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected\n');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
};

const testMinimumDuration = async () => {
  try {
    console.log('🧪 Testing Bundle Minimum Duration Calculation\n');
    console.log('='.repeat(60));

    const bundles = await Bundle.find().populate('items.category');
    
    if (bundles.length === 0) {
      console.log('\n⚠️  No bundles found in database');
      return;
    }

    for (const bundle of bundles) {
      const minDuration = await bundle.getMinimumDuration();
      
      console.log(`\n📦 Bundle: ${bundle.name}`);
      console.log(`   Price: ₹${bundle.price} per ${bundle.billingCycle}`);
      console.log(`   Minimum Duration: ${minDuration} month(s)`);
      console.log(`   Items:`);
      
      bundle.items.forEach(item => {
        if (item.category) {
          console.log(`      • ${item.quantity}x ${item.category.name} (min: ${item.category.minimumDuration} month(s))`);
        }
      });

      // Show available duration options
      const standardDurations = [1, 3, 6, 12];
      const availableDurations = standardDurations.filter(d => d >= minDuration);
      console.log(`   Available Durations: ${availableDurations.join(', ')} months`);
      
      if (minDuration > 1) {
        const hiddenDurations = standardDurations.filter(d => d < minDuration);
        console.log(`   ❌ Hidden Durations: ${hiddenDurations.join(', ')} month(s)`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('\n✅ Test completed successfully!\n');

  } catch (error) {
    console.error('❌ Error testing minimum duration:', error);
    throw error;
  }
};

const run = async () => {
  await connectDB();
  await testMinimumDuration();
  await mongoose.connection.close();
  console.log('✅ Database connection closed\n');
};

run().catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
