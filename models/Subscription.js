const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    index: true
  },
  bundleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bundle',
    required: [true, 'Bundle ID is required']
  },
  // ── Auto-generated bundle order ID ──────────────────────────────────────
  // Format: B{3-letter bundle prefix}X{5-digit sequence}
  // e.g. BSINX00001 for "Single Bed Plan" first order
  bundleOrderId: {
    type: String,
    unique: true,
    sparse: true,
    uppercase: true,
    trim: true,
    index: true
  },
  duration: {
    type: Number,
    enum: [1, 3, 6, 12],
    required: [true, 'Duration is required']
  },
  originalPrice: {
    type: Number,
    required: [true, 'Original price is required'],
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0
  },
  finalPrice: {
    type: Number,
    required: [true, 'Final price is required'],
    min: 0
  },
  fixedDeposit: {
    type: Number,
    required: [true, 'Security deposit is required'],
    min: 0
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'cancelled'],
    default: 'active',
    index: true
  },
  deliveryDate: {
    type: Date
  },
  pickupDate: {
    type: Date
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  cancellationReason: {
    type: String
  },
  cancelledAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Compound indexes for queries
subscriptionSchema.index({ userId: 1, status: 1 });
subscriptionSchema.index({ propertyId: 1, status: 1 });

// Pre-save hook to calculate end date
subscriptionSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('startDate') || this.isModified('duration')) {
    const startDate = new Date(this.startDate);
    this.endDate = new Date(startDate.setMonth(startDate.getMonth() + this.duration));
  }
  next();
});

// Instance method to check if subscription is expired
subscriptionSchema.methods.isExpired = function() {
  return this.endDate < new Date();
};

// Instance method to check if subscription is active
subscriptionSchema.methods.isActive = function() {
  return this.status === 'active' && !this.isExpired();
};

// Instance method to pause subscription
subscriptionSchema.methods.pause = async function() {
  this.status = 'paused';
  await this.save();
};

// Instance method to resume subscription
subscriptionSchema.methods.resume = async function() {
  if (this.status === 'paused') {
    this.status = 'active';
    await this.save();
  }
};

// Instance method to cancel subscription
subscriptionSchema.methods.cancel = async function(reason) {
  this.status = 'cancelled';
  this.cancellationReason = reason;
  this.cancelledAt = new Date();
  await this.save();
};

// Static method to get active subscriptions for user
subscriptionSchema.statics.getActiveSubscriptions = async function(userId) {
  return this.find({
    userId,
    status: 'active',
    endDate: { $gt: new Date() }
  }).populate('bundleId');
};

// Static method to get subscriptions by property
subscriptionSchema.statics.getPropertySubscriptions = async function(propertyId) {
  return this.find({ propertyId }).populate('bundleId');
};

const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = Subscription;
