/**
 * Script to update category minimum durations
 * 
 * This script sets appropriate minimum subscription durations for different categories:
 * - Quilt: 3 months minimum (heavy items, longer commitment)
 * - Bedsheets: 1 month minimum (standard items)
 * - Pillow Covers: 1 month minimum (standard items)
 * - Curtains: 3 months minimum (larger items, longer commitment)
 * - Towels: 1 month minimum (standard items)
 * 
 * Usage: node scripts/updateCategoryMinimumDurations.js
 */

const mongoose = require('mongoose');
const Category = require('../models/Category');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
};

// Category minimum duration rules
const categoryDurationRules = {
  'Quilt': 3,           // Heavy items, longer commitment
  'Bedsheet': 1,        // Standard items
  'Pillow Cover': 1,    // Standard items
  'Curtain': 3,         // Larger items, longer commitment
  'Towel': 1,           // Standard items
  'Blanket': 3,         // Heavy items, longer commitment
  'Comforter': 3,       // Heavy items, longer commitment
  'Mattress Protector': 1, // Standard items
  'Duvet': 3,           // Heavy items, longer commitment
  'Cushion Cover': 1    // Standard items
};

const updateCategoryDurations = async () => {
  try {
    console.log('\n🔄 Updating Category Minimum Durations...\n');

    // Get all categories
    const categories = await Category.find({});
    console.log(`📋 Found ${categories.length} categories\n`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const category of categories) {
      // Find matching rule (case-insensitive, partial match)
      let newMinDuration = 1; // Default to 1 month
      
      for (const [ruleName, duration] of Object.entries(categoryDurationRules)) {
        if (category.name.toLowerCase().includes(ruleName.toLowerCase())) {
          newMinDuration = duration;
          break;
        }
      }

      // Update if different from current value
      if (category.minimumDuration !== newMinDuration) {
        const oldDuration = category.minimumDuration;
        category.minimumDuration = newMinDuration;
        await category.save();
        
        console.log(`✅ Updated: ${category.name}`);
        console.log(`   Old: ${oldDuration} month(s) → New: ${newMinDuration} month(s)`);
        updatedCount++;
      } else {
        console.log(`⏭️  Skipped: ${category.name} (already ${newMinDuration} month(s))`);
        skippedCount++;
      }
    }

    console.log('\n📊 Summary:');
    console.log(`   ✅ Updated: ${updatedCount} categories`);
    console.log(`   ⏭️  Skipped: ${skippedCount} categories`);
    console.log(`   📋 Total: ${categories.length} categories\n`);

    // Display current state
    console.log('📋 Current Category Minimum Durations:\n');
    const updatedCategories = await Category.find({}).sort({ name: 1 });
    
    const grouped = {
      '1 Month': [],
      '3 Months': [],
      '6 Months': [],
      '12 Months': []
    };

    updatedCategories.forEach(cat => {
      const key = `${cat.minimumDuration} ${cat.minimumDuration === 1 ? 'Month' : 'Months'}`;
      if (grouped[key]) {
        grouped[key].push(cat.name);
      }
    });

    for (const [duration, categories] of Object.entries(grouped)) {
      if (categories.length > 0) {
        console.log(`   ${duration}:`);
        categories.forEach(name => console.log(`      • ${name}`));
      }
    }

    console.log('\n✅ Category minimum durations updated successfully!\n');

  } catch (error) {
    console.error('❌ Error updating categories:', error);
    throw error;
  }
};

const run = async () => {
  await connectDB();
  await updateCategoryDurations();
  await mongoose.connection.close();
  console.log('✅ Database connection closed');
  console.log('🎉 Done!\n');
};

run().catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
