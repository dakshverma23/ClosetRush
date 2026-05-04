const mongoose = require('mongoose');

const subscriptionRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  bundleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bundle',
    required: true
  },
  duration: {
    type: Number,
    enum: [1, 3, 6, 12],
    required: true
  },
  // Pricing breakdown
  subscriptionPrice: {
    type: Number,
    required: true,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0
  },
  discountPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  finalSubscriptionPrice: {
    type: Number,
    required: true,
    min: 0
  },
  fixedDeposit: {
    type: Number,
    required: true,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  // Bed configuration for deposit calculation
  bedConfiguration: {
    singleBeds: {
      type: Number,
      default: 0,
      min: 0
    },
    doubleBeds: {
      type: Number,
      default: 0,
      min: 0
    },
    curtainSets: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  // Payment details
  paymentMethod: {
    type: String,
    enum: ['razorpay', 'paytm', 'phonepe', 'upi', 'bank_transfer', 'pending'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
    default: 'pending',
    index: true
  },
  paymentId: {
    type: String,
    trim: true
  },
  paymentDate: {
    type: Date
  },
  // Razorpay specific fields
  razorpayOrderId: {
    type: String,
    trim: true
  },
  razorpayPaymentId: {
    type: String,
    trim: true
  },
  razorpaySignature: {
    type: String,
    trim: true
  },
  // Request status
  status: {
    type: String,
    enum: ['pending_payment', 'payment_completed', 'subscription_created', 'cancelled'],
    default: 'pending_payment',
    index: true
  },
  subscriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription'
    // Set when subscription is created after payment
  },
  // Delivery preferences
  deliveryAddress: {
    type: String,
    trim: true
  },
  mobileNo: {
    type: String,
    trim: true
  },
  pincode: {
    type: String,
    trim: true
  },
  state: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    trim: true
  },
  area: {
    type: String,
    trim: true
  },
  locality: {
    type: String,
    trim: true
  },
  buildingName: {
    type: String,
    trim: true
  },
  floor: {
    type: String,
    trim: true
  },
  roomNo: {
    type: String,
    trim: true
  },
  landmark: {
    type: String,
    trim: true
  },
  preferredDeliveryDate: {
    type: Date
  },
  preferredDeliveryTime: {
    type: String,
    enum: ['morning', 'afternoon', 'evening'],
    trim: true
  },
  specialInstructions: {
    type: String,
    trim: true
  },
  // Cancellation
  cancellationReason: {
    type: String
  },
  cancelledAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Compound indexes
subscriptionRequestSchema.index({ userId: 1, status: 1 });
subscriptionRequestSchema.index({ paymentStatus: 1, createdAt: -1 });

// Instance method to mark payment as completed
subscriptionRequestSchema.methods.completePayment = async function(paymentId, paymentMethod) {
  this.paymentStatus = 'completed';
  this.paymentId = paymentId;
  this.paymentMethod = paymentMethod;
  this.paymentDate = new Date();
  this.status = 'payment_completed';
  await this.save();
};

// Instance method to create subscription after payment
subscriptionRequestSchema.methods.createSubscription = async function() {
  const Subscription = require('./Subscription');
  const Bundle = require('./Bundle');

  // ── Generate bundleOrderId ──────────────────────────────────────────────
  // Format: B + first 3 letters of each word in bundle name (max 3 words) + X + 5-digit seq
  // e.g. "Single Bed Plan" → BSINBEDPLAX00001
  // e.g. "Premium Bundle"  → BPREX00001 (only 2 words → 3+3 = 6 chars)
  const bundle = await Bundle.findById(this.bundleId);
  const words  = (bundle?.name || 'BUN').trim().split(/\s+/).slice(0, 3);
  const prefix = words.map(w => w.substring(0, 3).toUpperCase()).join('');
  const tag    = `B${prefix}X`;

  // Count existing subscriptions with this prefix to get next sequence
  const count = await Subscription.countDocuments({
    bundleOrderId: new RegExp(`^${tag}`)
  });
  const seq = String(count + 1).padStart(5, '0');
  const bundleOrderId = `${tag}${seq}`;

  const subscription = await Subscription.create({
    userId:        this.userId,
    bundleId:      this.bundleId,
    bundleOrderId,
    duration:      this.duration,
    originalPrice: this.subscriptionPrice,
    discount:      this.discount,
    finalPrice:    this.finalSubscriptionPrice,
    fixedDeposit:  this.fixedDeposit,
    status:        'active',
    startDate:     new Date()
  });

  this.subscriptionId = subscription._id;
  this.status = 'subscription_created';
  await this.save();

  // Create fulfillment Order for this subscription
  // Determine if this is a renewal (prior subscription exists for same user + bundle)
  const Order = require('./Order');
  const User = require('./User');

  const priorSub = await Subscription.findOne({
    userId: this.userId,
    bundleId: this.bundleId,
    _id: { $ne: subscription._id }
  });
  const isRenewal = !!priorSub;

  const newOrder = await Order.create({
    userId:         this.userId,
    subscriptionId: subscription._id,
    orderedBundles: (bundle.items || []).map(item => ({
      bundleTypeId: item.category,
      bundleName:   bundle.name,
      quantity:     item.quantity
    })),
    builtBundles: [],
    status:       'pending',
    orderType:    isRenewal ? 'renewal' : 'standard'
  });

  // Notify admin of renewal order
  if (isRenewal) {
    const { notifyRenewalOrderCreated } = require('../services/notificationService');
    const admin = await User.findOne({ userType: 'admin' });
    if (admin) {
      await notifyRenewalOrderCreated(admin._id, newOrder);
    }
  }

  return subscription;
};

// Static method to get pending payments
subscriptionRequestSchema.statics.getPendingPayments = async function(userId) {
  return this.find({
    userId,
    status: 'pending_payment'
  }).populate('bundleId').sort({ createdAt: -1 });
};

const SubscriptionRequest = mongoose.model('SubscriptionRequest', subscriptionRequestSchema);

module.exports = SubscriptionRequest;
