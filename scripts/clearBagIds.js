/**
 * scripts/clearBagIds.js
 * Clears pre-seeded bagMarking values from all inventory items.
 * Bag IDs should only be set by the warehouse manager when building bundles.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const InventoryItem = require('../models/InventoryItem');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  const result = await InventoryItem.updateMany(
    { bagMarking: { $exists: true, $ne: null, $ne: '' } },
    { $unset: { bagMarking: '' } }
  );

  console.log(`✅ Cleared bagMarking from ${result.modifiedCount} inventory items`);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
