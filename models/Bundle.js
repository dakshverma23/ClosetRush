const mongoose = require('mongoose');

const bundleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Bundle name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  image: {
    type: String,
    trim: true,
    default: ''
  },
  items: [{
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1']
    }
  }],
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price must be positive']
  },
  securityDeposit: {
    type: Number,
    required: [true, 'Security deposit is required'],
    min: [0, 'Security deposit must be positive'],
    default: 0
  },
  billingCycle: {
    type: String,
    enum: ['monthly', 'quarterly', 'yearly'],
    required: [true, 'Billing cycle is required'],
    default: 'monthly'
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for active bundles
bundleSchema.index({ active: 1 });

// Method to calculate total price based on category prices
bundleSchema.methods.calculateTotalPrice = async function() {
  await this.populate('items.category');
  
  let total = 0;
  for (const item of this.items) {
    if (item.category && item.category.price) {
      total += item.category.price * item.quantity;
    }
  }
  
  return total;
};

// Method to calculate minimum duration based on categories
bundleSchema.methods.getMinimumDuration = async function() {
  await this.populate('items.category');
  
  let maxMinimumDuration = 1; // Default to 1 month
  for (const item of this.items) {
    if (item.category && item.category.minimumDuration) {
      maxMinimumDuration = Math.max(maxMinimumDuration, item.category.minimumDuration);
    }
  }
  
  return maxMinimumDuration;
};

// Method to calculate deposit based on category deposit amounts and minimum durations
bundleSchema.methods.calculateDeposit = async function() {
  await this.populate('items.category');
  
  let totalDeposit = 0;
  for (const item of this.items) {
    if (item.category && item.category.depositAmount && item.category.minimumDuration) {
      // Deposit = category deposit amount × category minimum duration × quantity
      totalDeposit += item.category.depositAmount * item.category.minimumDuration * item.quantity;
    }
  }
  
  return totalDeposit;
};

// Virtual for deposit calculation (can be customized based on business logic)
bundleSchema.virtual('depositAmount').get(function() {
  // Simple deposit calculation: 20% of bundle price
  return Math.round(this.price * 0.2);
});

// Ensure virtuals are included in JSON
bundleSchema.set('toJSON', { virtuals: true });
bundleSchema.set('toObject', { virtuals: true });

const Bundle = mongoose.model('Bundle', bundleSchema);

module.exports = Bundle;
