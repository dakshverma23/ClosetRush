const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  name: {
    type: String,
    required: [true, 'Property name is required'],
    trim: true
  },
  address: {
    type: String,
    required: [true, 'Property address is required'],
    trim: true
  },
  propertyType: {
    type: String,
    enum: ['pg', 'homestay', 'rental', 'apartment_building', 'other'],
    default: 'other'
  },
  contactPerson: {
    name: String,
    phone: String,
    email: String
  },
  totalUnits: {
    type: Number,
    min: 0,
    default: 1
  },
  active: {
    type: Boolean,
    default: true
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Index for user's properties
propertySchema.index({ userId: 1, active: 1 });

// Virtual for subscription count
propertySchema.virtual('subscriptionCount', {
  ref: 'Subscription',
  localField: '_id',
  foreignField: 'propertyId',
  count: true
});

// Virtual for active subscription count
propertySchema.virtual('activeSubscriptionCount', {
  ref: 'Subscription',
  localField: '_id',
  foreignField: 'propertyId',
  match: { status: 'active' },
  count: true
});

// Ensure virtuals are included in JSON
propertySchema.set('toJSON', { virtuals: true });
propertySchema.set('toObject', { virtuals: true });

// Instance method to check if property has active subscriptions
propertySchema.methods.hasActiveSubscriptions = async function() {
  const Subscription = require('./Subscription');
  const count = await Subscription.countDocuments({
    propertyId: this._id,
    status: 'active'
  });
  return count > 0;
};

// Static method to get user's properties
propertySchema.statics.getUserProperties = async function(userId) {
  return this.find({ userId, active: true }).sort({ createdAt: -1 });
};

const Property = mongoose.model('Property', propertySchema);

module.exports = Property;
