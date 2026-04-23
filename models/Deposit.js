const mongoose = require('mongoose');

const depositSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    index: true
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  remainingAmount: {
    type: Number,
    required: true,
    min: 0
  },
  deductions: [{
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    reason: {
      type: String,
      required: true
    },
    deductedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    deductedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Compound unique index
depositSchema.index({ userId: 1, propertyId: 1 }, { unique: true });

// Instance method to deduct amount
depositSchema.methods.deduct = async function(amount, reason, deductedBy) {
  if (amount > this.remainingAmount) {
    throw new Error('Deduction amount exceeds remaining deposit');
  }

  this.deductions.push({
    amount,
    reason,
    deductedBy
  });

  this.remainingAmount -= amount;
  await this.save();
};

const Deposit = mongoose.model('Deposit', depositSchema);

module.exports = Deposit;
