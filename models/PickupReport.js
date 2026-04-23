const mongoose = require('mongoose');

// Submitted by the pickup member at the customer's door
const pickupReportSchema = new mongoose.Schema({
  // ── Link to item ──────────────────────────────────────────────────────────
  inventoryItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InventoryItem',
    required: true
  },
  skuCode: { type: String, required: true, uppercase: true },
  bundleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bundle',
    required: true
  },

  // ── Location at time of pickup ────────────────────────────────────────────
  pgName:  { type: String, trim: true },
  roomNo:  { type: String, trim: true },
  area:    { type: String, trim: true },
  pincode: { type: String, trim: true },

  // ── Pickup member ─────────────────────────────────────────────────────────
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  submittedAt: { type: Date, default: Date.now },

  // ── Condition assessment ──────────────────────────────────────────────────
  dirtyLevel: {
    type: Number,
    min: 0,
    max: 10,
    required: true
  },
  wearAndTear: {
    type: String,
    enum: ['none', 'minor', 'moderate', 'heavy', 'damaged'],
    required: true
  },
  wearNotes: { type: String, trim: true },

  // ── Bag ───────────────────────────────────────────────────────────────────
  bagMarking:   { type: String, trim: true },
  bagCondition: {
    type: String,
    enum: ['ok', 'torn', 'missing'],
    default: 'ok'
  },

  // ── Photo evidence ────────────────────────────────────────────────────────
  // Array of Cloudinary URLs or base64 data URLs
  photos: [{ type: String }],

  // ── Verification ─────────────────────────────────────────────────────────
  verifiedByAdmin: { type: Boolean, default: false },
  adminNotes:      { type: String, trim: true }
}, { timestamps: true });

pickupReportSchema.index({ inventoryItemId: 1 });
pickupReportSchema.index({ skuCode: 1 });
pickupReportSchema.index({ pgName: 1 });
pickupReportSchema.index({ submittedAt: -1 });

module.exports = mongoose.model('PickupReport', pickupReportSchema);
