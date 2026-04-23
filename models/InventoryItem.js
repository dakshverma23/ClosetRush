const mongoose = require('mongoose');

// Represents a single physical SKU unit tracked end-to-end
const inventoryItemSchema = new mongoose.Schema({
  // ── Identity ──────────────────────────────────────────────────────────────
  skuCode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  bundleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bundle',
    required: true
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  bagMarking: {
    type: String,
    trim: true   // e.g. "BAG-001-A"
  },

  // ── Location ──────────────────────────────────────────────────────────────
  pgName: { type: String, trim: true },
  roomNo: { type: String, trim: true },
  area:   { type: String, trim: true },
  pincode:{ type: String, trim: true },

  // ── Status ────────────────────────────────────────────────────────────────
  status: {
    type: String,
    enum: ['in_stock', 'dispatched', 'with_customer', 'pickup_pending', 'in_laundry', 'damaged', 'retired'],
    default: 'in_stock'
  },
  condition: {
    type: String,
    enum: ['new', 'good', 'fair', 'worn', 'damaged'],
    default: 'new'
  },

  // ── Assignment ────────────────────────────────────────────────────────────
  assignedTo: {
    userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', sparse: true },
    assignedAt: { type: Date }
  },

  // ── Dispatch / Pickup log ─────────────────────────────────────────────────
  dispatchedAt: { type: Date },
  pickedUpAt:   { type: Date },

  notes: { type: String, trim: true }
}, { timestamps: true });

inventoryItemSchema.index({ skuCode: 1 });
inventoryItemSchema.index({ bundleId: 1 });
inventoryItemSchema.index({ pgName: 1 });
inventoryItemSchema.index({ status: 1 });

module.exports = mongoose.model('InventoryItem', inventoryItemSchema);
