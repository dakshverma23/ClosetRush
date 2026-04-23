require('dotenv').config();
const mongoose = require('mongoose');
const Bundle = require('../models/Bundle');

const defaultBundles = [
  {
    name: 'Single Bed Bundle',
    items: {
      singleBedsheets: 4,
      doubleBedsheets: 0,
      pillowCovers: 4,
      curtains: 0
    },
    price: 500,
    billingCycle: 'monthly',
    description: '4 single bedsheets + 4 pillow covers delivered monthly',
    active: true
  },
  {
    name: 'Double Bed Bundle',
    items: {
      singleBedsheets: 0,
      doubleBedsheets: 4,
      pillowCovers: 8,
      curtains: 0
    },
    price: 1000,
    billingCycle: 'monthly',
    description: '4 double bedsheets + 8 pillow covers delivered monthly',
    active: true
  },
  {
    name: 'Curtains Bundle',
    items: {
      singleBedsheets: 0,
      doubleBedsheets: 0,
      pillowCovers: 0,
      curtains: 2
    },
    price: 200,
    billingCycle: 'quarterly',
    description: 'Set of 2 curtains delivered every 3 months',
    active: true
  }
];

const seedBundles = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing bundles
    await Bundle.deleteMany({});
    console.log('🗑️  Cleared existing bundles');

    // Insert default bundles
    const bundles = await Bundle.insertMany(defaultBundles);
    console.log(`✅ Seeded ${bundles.length} default bundles:`);
    
    bundles.forEach(bundle => {
      console.log(`   - ${bundle.name} (₹${bundle.price}/${bundle.billingCycle})`);
    });

    console.log('\n✨ Seed completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding bundles:', error);
    process.exit(1);
  }
};

seedBundles();
