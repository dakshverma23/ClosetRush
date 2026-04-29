const mongoose = require('mongoose');

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
  bundleSummary: { type: String, trim: true },   // e.g. "2x Bedroom Bundle"
  bagIds: [{ type: String, trim: true }],
  skuCodes: [{ type: String, trim: true, uppercase: true }],

  // ── Quality notes ─────────────────────────────────────────────────────────
  notes: { type: String, trim: true },
  overallCondition: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor'],
    default: 'good'
  },

  // ── Photo evidence (Cloudinary URLs) ─────────────────────────────────────
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
