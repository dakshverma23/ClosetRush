const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  condition: {
    type: String,
    enum: ['new', 'good', 'fair', 'damaged'],
    required: true
  },
  assignedTo: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      sparse: true
    },
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      index: true,
      sparse: true
    },
    assignedAt: {
      type: Date
    }
  }
}, {
  timestamps: true
});

const Inventory = mongoose.model('Inventory', inventorySchema);

module.exports = Inventory;
