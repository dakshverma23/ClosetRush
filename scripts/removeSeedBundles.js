/**
 * scripts/removeSeedBundles.js
 *
 * Removes the 3 duplicate bundles created by seedTestData.js
 * (Single Bed Plan, Double Bed Plan, Curtain Plan) and reassigns
 * their inventory items to the original bundles.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Bundle = require('../models/Bundle');
const InventoryItem = require('../models/InventoryItem');
require('../models/Category'); // register Category schema for populate

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB\n');

  // ── Find originals and duplicates ─────────────────────────────────────────
  const [origSingle, origDouble, origCurtain] = await Promise.all([
    Bundle.findOne({ name: 'Single Bed Bundle' }),
    Bundle.findOne({ name: 'Double Bed Bundle' }),
    Bundle.findOne({ name: 'Curtains Bundle' })
  ]);

  const [dupSingle, dupDouble, dupCurtain] = await Promise.all([
    Bundle.findOne({ name: 'Single Bed Plan' }),
    Bundle.findOne({ name: 'Double Bed Plan' }),
    Bundle.findOne({ name: 'Curtain Plan' })
  ]);

  console.log('Original bundles:');
  console.log(`  Single Bed Bundle: ${origSingle?._id}`);
  console.log(`  Double Bed Bundle: ${origDouble?._id}`);
  console.log(`  Curtains Bundle:   ${origCurtain?._id}`);
  console.log('\nDuplicate bundles to remove:');
  console.log(`  Single Bed Plan: ${dupSingle?._id}`);
  console.log(`  Double Bed Plan: ${dupDouble?._id}`);
  console.log(`  Curtain Plan:    ${dupCurtain?._id}`);

  // ── Reassign inventory items ───────────────────────────────────────────────
  const reassignments = [
    { from: dupSingle, to: origSingle, label: 'Single Bed Plan → Single Bed Bundle' },
    { from: dupDouble, to: origDouble, label: 'Double Bed Plan → Double Bed Bundle' },
    { from: dupCurtain, to: origCurtain, label: 'Curtain Plan → Curtains Bundle' }
  ];

  console.log('\n🔄 Reassigning inventory items...');
  for (const { from, to, label } of reassignments) {
    if (!from || !to) {
      console.log(`   ⚠️  Skipping ${label} — bundle not found`);
      continue;
    }
    const result = await InventoryItem.updateMany(
      { bundleId: from._id },
      { $set: { bundleId: to._id } }
    );
    console.log(`   ✓ ${label}: ${result.modifiedCount} items reassigned`);
  }

  // ── Delete duplicate bundles ───────────────────────────────────────────────
  console.log('\n🗑️  Deleting duplicate bundles...');
  for (const { from, label } of reassignments) {
    if (!from) continue;
    await Bundle.findByIdAndDelete(from._id);
    console.log(`   ✗ Deleted: "${from.name}"`);
  }

  // ── Final state ────────────────────────────────────────────────────────────
  const finalBundles = await Bundle.find({}).populate('items.category', 'name');
  const finalItems = await InventoryItem.countDocuments();

  console.log('\n─────────────────────────────────────────────');
  console.log('✨ Done!');
  console.log(`   Bundles remaining: ${finalBundles.length}`);
  finalBundles.forEach(b => {
    const cats = b.items.map(i => `${i.quantity}x ${i.category?.name || '?'}`).join(', ');
    console.log(`   • "${b.name}" — ${cats}`);
  });
  console.log(`   Inventory items: ${finalItems}`);
  console.log('─────────────────────────────────────────────\n');

  await mongoose.disconnect();
  process.exit(0);
}

run().catch(err => {
  console.error('❌ Failed:', err);
  process.exit(1);
});
