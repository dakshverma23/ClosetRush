const mongoose = require('mongoose');

// Per-SKU photo entry
const skuPhotoSchema = new mongoose.Schema({
  skuCode: { type: String, trim: true, uppercase: true, required: true },
  photos: [{ type: String }]   // Cloudinary URLs
}, { _id: false });

const qualityCheckSchema = new mongoose.Schema({
  // ── Links ─────────────────────────────────────────────────────────────────
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // ── Bundle details ────────────────────────────────────────────────────────
  bundleSummary: { type: String, trim: true },
  bagId: { type: String, trim: true },

  // ── Per-SKU photos (new structure) ────────────────────────────────────────
  skuPhotos: [skuPhotoSchema],   // one entry per SKU with its photos

  // ── Quality notes ─────────────────────────────────────────────────────────
  notes: { type: String, trim: true },
  overallCondition: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor'],
    default: 'good'
  },

  // ── Legacy flat image list (kept for backward compat) ─────────────────────
  images: [{ type: String }],

  // ── Admin review ──────────────────────────────────────────────────────────
  reviewedByAdmin: { type: Boolean, default: false },
  adminNotes: { type: String, trim: true },
  reviewedAt: { type: Date }
}, { timestamps: true });

qualityCheckSchema.index({ orderId: 1 });
qualityCheckSchema.index({ submittedBy: 1 });
qualityCheckSchema.index({ createdAt: -1 });

module.exports = mongoose.model('QualityCheck', qualityCheckSchema);
