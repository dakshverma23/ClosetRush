/**
 * scripts/seedTestData.js
 *
 * Seeds test data for the subscription-order-fulfillment feature:
 *   1. Categories (if none exist)
 *   2. Bundles (if none exist)
 *   3. InventoryItems — 30 in_stock SKUs spread across the bundles
 *   4. A test Order in 'pending' status (linked to the first individual user found,
 *      or a dummy ObjectId if no user exists yet)
 *
 * Safe to run multiple times — uses upsert / findOrCreate patterns.
 *
 * Usage:
 *   node scripts/seedTestData.js
 *   npm run seed:test
 */

require('dotenv').config();
const mongoose = require('mongoose');

const Category     = require('../models/Category');
const Bundle       = require('../models/Bundle');
const InventoryItem = require('../models/InventoryItem');
const Order        = require('../models/Order');
const User         = require('../models/User');
const Subscription = require('../models/Subscription');

// ─── Helpers ──────────────────────────────────────────────────────────────────

const pad = (n, len = 3) => String(n).padStart(len, '0');

// ─── Category definitions ─────────────────────────────────────────────────────

const CATEGORY_DEFS = [
  { name: 'Single Bedsheet',  description: 'Single-size cotton bedsheet',  price: 120, depositAmount: 200, minimumDuration: 1 },
  { name: 'Double Bedsheet',  description: 'Double-size cotton bedsheet',  price: 180, depositAmount: 300, minimumDuration: 1 },
  { name: 'Pillow Cover',     description: 'Standard pillow cover',        price:  40, depositAmount:  80, minimumDuration: 1 },
  { name: 'Curtain Set',      description: 'Pair of window curtains',      price: 250, depositAmount: 400, minimumDuration: 3 },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  // ── 1. Categories ──────────────────────────────────────────────────────────
  console.log('\n📦 Seeding categories...');
  const categoryMap = {}; // name → document

  for (const def of CATEGORY_DEFS) {
    let cat = await Category.findOne({ name: def.name });
    if (!cat) {
      cat = await Category.create({ ...def, active: true });
      console.log(`   ✚ Created category: ${cat.name}`);
    } else {
      console.log(`   ✓  Category exists: ${cat.name}`);
    }
    categoryMap[cat.name] = cat;
  }

  // ── 2. Bundles ─────────────────────────────────────────────────────────────
  console.log('\n🎁 Seeding bundles...');

  const BUNDLE_DEFS = [
    {
      name: 'Single Bed Plan',
      description: '4 single bedsheets + 4 pillow covers — monthly',
      price: 599,
      securityDeposit: 500,
      billingCycle: 'monthly',
      items: [
        { categoryName: 'Single Bedsheet', quantity: 4 },
        { categoryName: 'Pillow Cover',    quantity: 4 },
      ],
    },
    {
      name: 'Double Bed Plan',
      description: '4 double bedsheets + 8 pillow covers — monthly',
      price: 999,
      securityDeposit: 800,
      billingCycle: 'monthly',
      items: [
        { categoryName: 'Double Bedsheet', quantity: 4 },
        { categoryName: 'Pillow Cover',    quantity: 8 },
      ],
    },
    {
      name: 'Curtain Plan',
      description: '2 curtain sets — quarterly',
      price: 599,
      securityDeposit: 600,
      billingCycle: 'quarterly',
      items: [
        { categoryName: 'Curtain Set', quantity: 2 },
      ],
    },
  ];

  const bundleMap = {}; // name → document

  for (const def of BUNDLE_DEFS) {
    let bundle = await Bundle.findOne({ name: def.name });
    if (!bundle) {
      bundle = await Bundle.create({
        name:            def.name,
        description:     def.description,
        price:           def.price,
        securityDeposit: def.securityDeposit,
        billingCycle:    def.billingCycle,
        active:          true,
        items: def.items.map(i => ({
          category: categoryMap[i.categoryName]._id,
          quantity: i.quantity,
        })),
      });
      console.log(`   ✚ Created bundle: ${bundle.name}`);
    } else {
      console.log(`   ✓  Bundle exists: ${bundle.name}`);
    }
    bundleMap[bundle.name] = bundle;
  }

  // ── 3. Inventory Items ─────────────────────────────────────────────────────
  console.log('\n🏷️  Seeding inventory items...');

  // 10 items per bundle type, all in_stock
  const INVENTORY_DEFS = [
    // Single Bed Plan items — Single Bedsheets
    ...Array.from({ length: 10 }, (_, i) => ({
      skuCode:    `SBS-${pad(i + 1)}`,
      bundleName: 'Single Bed Plan',
      catName:    'Single Bedsheet',
      bagMarking: `BAG-SBS-${pad(i + 1)}`,
    })),
    // Double Bed Plan items — Double Bedsheets
    ...Array.from({ length: 10 }, (_, i) => ({
      skuCode:    `DBS-${pad(i + 1)}`,
      bundleName: 'Double Bed Plan',
      catName:    'Double Bedsheet',
      bagMarking: `BAG-DBS-${pad(i + 1)}`,
    })),
    // Curtain Plan items
    ...Array.from({ length: 10 }, (_, i) => ({
      skuCode:    `CRT-${pad(i + 1)}`,
      bundleName: 'Curtain Plan',
      catName:    'Curtain Set',
      bagMarking: `BAG-CRT-${pad(i + 1)}`,
    })),
  ];

  let createdItems = 0;
  let skippedItems = 0;

  for (const def of INVENTORY_DEFS) {
    const existing = await InventoryItem.findOne({ skuCode: def.skuCode });
    if (existing) {
      skippedItems++;
      continue;
    }
    await InventoryItem.create({
      skuCode:    def.skuCode,
      bundleId:   bundleMap[def.bundleName]._id,
      categoryId: categoryMap[def.catName]._id,
      bagMarking: def.bagMarking,
      status:     'in_stock',
      condition:  'new',
      pgName:     'Test PG Koramangala',
      area:       'Koramangala',
      pincode:    '560034',
    });
    createdItems++;
  }

  console.log(`   ✚ Created ${createdItems} inventory items`);
  if (skippedItems) console.log(`   ✓  Skipped ${skippedItems} already-existing items`);

  // ── 4. Test Order ──────────────────────────────────────────────────────────
  console.log('\n📋 Seeding test order...');

  // Find the first individual user to attach the order to
  const individualUser = await User.findOne({ userType: 'individual' });
  if (!individualUser) {
    console.log('   ⚠️  No individual user found — skipping order seed.');
    console.log('      Register an individual user first, then re-run this script.');
  } else {
    // Find or create a dummy subscription for this user
    let subscription = await Subscription.findOne({ userId: individualUser._id });

    if (!subscription) {
      const singleBundle = bundleMap['Single Bed Plan'];
      subscription = await Subscription.create({
        userId:        individualUser._id,
        bundleId:      singleBundle._id,
        bundleOrderId: 'BSINBEDPLAX00001',
        duration:      1,
        originalPrice: singleBundle.price,
        discount:      0,
        finalPrice:    singleBundle.price,
        fixedDeposit:  singleBundle.securityDeposit,
        status:        'active',
        startDate:     new Date(),
        endDate:       new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
      console.log(`   ✚ Created test subscription for ${individualUser.email}`);
    } else {
      console.log(`   ✓  Using existing subscription for ${individualUser.email}`);
    }

    // Check if a test order already exists for this user
    const existingOrder = await Order.findOne({ userId: individualUser._id, status: 'pending' });
    if (existingOrder) {
      console.log(`   ✓  Pending order already exists: ${existingOrder._id}`);
    } else {
      const singleBundle = bundleMap['Single Bed Plan'];
      const order = await Order.create({
        userId:         individualUser._id,
        subscriptionId: subscription._id,
        orderedBundles: [
          {
            bundleTypeId: singleBundle._id,
            bundleName:   singleBundle.name,
            quantity:     2,
          },
        ],
        builtBundles: [],
        status:       'pending',
      });
      console.log(`   ✚ Created test order: ${order._id} (status: pending)`);
      console.log(`      User: ${individualUser.email}`);
      console.log(`      Bundle: ${singleBundle.name} × 2`);
    }
  }

  // ── Summary ────────────────────────────────────────────────────────────────
  console.log('\n─────────────────────────────────────────────');
  console.log('✨ Seed complete! Here\'s what you can test:\n');
  console.log('  📌 Admin Dashboard → "Pending Orders" tab');
  console.log('     → Assign the test order to an approved pickup member\n');
  console.log('  📌 Pickup Member Dashboard → "Assigned Orders" tab');
  console.log('     → Click "Build Bundles" and enter SKU codes from below:\n');

  const skus = await InventoryItem.find({ status: 'in_stock' }).select('skuCode').limit(10);
  console.log('  Available in_stock SKU codes (use any in Build Bundles form):');
  skus.forEach(s => console.log(`     • ${s.skuCode}`));

  console.log('\n  📌 After building bundles:');
  console.log('     → Mark "Out for Delivery"');
  console.log('     → Submit Delivery Form (upload any image + address)');
  console.log('     → Admin approves → status becomes "delivered"\n');
  console.log('─────────────────────────────────────────────');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
