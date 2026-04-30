/**
 * scripts/cleanupBundles.js
 *
 * Cleans up duplicate / old-format bundles and orphaned inventory items.
 *
 * What it does:
 *   1. Finds bundles with old-format items (object, not array) and removes them
 *   2. Finds bundles with no items array and removes them
 *   3. Removes inventory items that reference non-existent bundles
 *   4. Ensures all remaining bundles have their items properly linked to categories
 *
 * Usage:
 *   node scripts/cleanupBundles.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Bundle = require('../models/Bundle');
const InventoryItem = require('../models/InventoryItem');
const Category = require('../models/Category');

async function cleanup() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB\n');

  // ── 1. List all bundles ────────────────────────────────────────────────────
  const allBundles = await Bundle.find({});
  console.log(`📦 Found ${allBundles.length} total bundles:\n`);
  allBundles.forEach(b => {
    const itemsType = Array.isArray(b.items) ? `array(${b.items.length})` : typeof b.items;
    console.log(`   [${b._id}] "${b.name}" — items: ${itemsType} — active: ${b.active}`);
  });

  // ── 2. Identify old-format bundles (items is not an array or is empty) ─────
  const oldFormatBundles = allBundles.filter(b => {
    if (!b.items) return true;
    if (!Array.isArray(b.items)) return true;
    // Old format had items as plain object with singleBedsheets etc
    if (b.items.length === 0) {
      // Check if it has old-style keys stored somewhere
      const raw = b.toObject();
      if (raw.items && !Array.isArray(raw.items)) return true;
    }
    return false;
  });

  // Also find bundles whose items array elements don't have a 'category' field
  const malformedBundles = allBundles.filter(b => {
    if (!Array.isArray(b.items) || b.items.length === 0) return false;
    return b.items.some(item => !item.category);
  });

  const toDelete = [...new Set([...oldFormatBundles, ...malformedBundles].map(b => b._id.toString()))];

  if (toDelete.length > 0) {
    console.log(`\n🗑️  Removing ${toDelete.length} old/malformed bundle(s)...`);
    for (const id of toDelete) {
      const b = allBundles.find(x => x._id.toString() === id);
      await Bundle.findByIdAndDelete(id);
      console.log(`   ✗ Deleted: "${b?.name}" [${id}]`);
    }
  } else {
    console.log('\n✅ No old-format bundles found.');
  }

  // ── 3. Get valid bundle IDs ────────────────────────────────────────────────
  const validBundles = await Bundle.find({}).populate('items.category', 'name');
  const validBundleIds = new Set(validBundles.map(b => b._id.toString()));

  console.log(`\n✅ Valid bundles remaining: ${validBundles.length}`);
  validBundles.forEach(b => {
    const cats = b.items.map(i => `${i.quantity}x ${i.category?.name || 'unknown'}`).join(', ');
    console.log(`   • "${b.name}" — ${cats} — ₹${b.price}/${b.billingCycle}`);
  });

  // ── 4. Remove orphaned inventory items ────────────────────────────────────
  const allItems = await InventoryItem.find({});
  const orphaned = allItems.filter(item => {
    if (!item.bundleId) return true;
    return !validBundleIds.has(item.bundleId.toString());
  });

  if (orphaned.length > 0) {
    console.log(`\n🗑️  Removing ${orphaned.length} orphaned inventory item(s)...`);
    const orphanedIds = orphaned.map(i => i._id);
    await InventoryItem.deleteMany({ _id: { $in: orphanedIds } });
    console.log(`   ✗ Deleted ${orphaned.length} orphaned items`);
  } else {
    console.log('\n✅ No orphaned inventory items found.');
  }

  // ── 5. Summary ─────────────────────────────────────────────────────────────
  const finalBundles = await Bundle.countDocuments();
  const finalItems = await InventoryItem.countDocuments();
  console.log('\n─────────────────────────────────────────────');
  console.log(`✨ Cleanup complete!`);
  console.log(`   Bundles: ${finalBundles}`);
  console.log(`   Inventory items: ${finalItems}`);
  console.log('─────────────────────────────────────────────\n');

  await mongoose.disconnect();
  process.exit(0);
}

cleanup().catch(err => {
  console.error('❌ Cleanup failed:', err);
  process.exit(1);
});
