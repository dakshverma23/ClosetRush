const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
    // Optional - can be null for non-registered users
  },
  businessName: {
    type: String,
    required: true,
    trim: true
  },
  contactPerson: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  businessType: {
    type: String,
    enum: ['pg', 'homestay', 'rental', 'building', 'hotel', 'other'],
    default: 'other'
  },
  // Type: connect (just a message) or quotation (bundle pricing request)
  type: {
    type: String,
    enum: ['connect', 'quotation'],
    default: 'quotation',
    index: true
  },
  // Bundle selections for quotation type
  bundleSelections: [{
    bundleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bundle'
    },
    bundleName: String,
    quantity: Number,
    duration: Number
  }],
  numberOfProperties: {
    type: Number,
    min: 1,
    default: 1
  },
  unitsPerProperty: {
    type: Number,
    min: 1,
    default: 1
  },
  totalUnits: {
    type: Number,
    min: 1,
    default: 1
  },
  estimatedCost: {
    original: Number,
    discount: Number,
    final: Number,
    deposit: Number,
    total: Number
  },
  // Property details (optional - used for old-style quotes)
  properties: [{
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property'
      // Optional - if selecting existing property
    },
    propertyName: String,
    address: String,
    numberOfUnits: {
      type: Number,
      min: 1
    },
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
    }
  }],
  // Additional requirements
  additionalRequirements: {
    type: String,
    trim: true
  },
  estimatedDeposit: {
    type: Number,
    min: 0
  },
  // Status workflow
  status: {
    type: String,
    enum: ['pending', 'contacted', 'quote_sent', 'negotiating', 'accepted', 'rejected'],
    default: 'pending',
    index: true
  },
  // Admin notes and tracking
  adminNotes: [{
    note: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  quotedAmount: {
    type: Number,
    min: 0
  },
  quotedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  quotedAt: {
    type: Date
  },
  // Follow-up tracking
  lastContactedAt: {
    type: Date
  },
  nextFollowUpDate: {
    type: Date
  }
}, {
  timestamps: true
});

quoteSchema.index({ email: 1 });
quoteSchema.index({ status: 1, createdAt: -1 });
quoteSchema.index({ userId: 1 });

// Instance method to add admin note
quoteSchema.methods.addNote = async function(note, adminId) {
  this.adminNotes.push({
    note,
    addedBy: adminId,
    addedAt: new Date()
  });
  await this.save();
};

// Instance method to update status
quoteSchema.methods.updateStatus = async function(status, adminId) {
  this.status = status;
  if (status === 'contacted') {
    this.lastContactedAt = new Date();
  }
  await this.save();
};

// Static method to get pending quotes
quoteSchema.statics.getPendingQuotes = async function() {
  return this.find({ status: 'pending' }).sort({ createdAt: -1 });
};

const Quote = mongoose.model('Quote', quoteSchema);

module.exports = Quote;
