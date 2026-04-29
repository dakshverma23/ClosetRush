const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  type: {
    type: String,
    enum: [
      // Existing
      'order_assigned',
      'order_packed',
      'out_for_delivery',
      'delivery_under_review',
      'order_delivered',
      'delivery_rejected',
      // New — order lifecycle (warehouse/logistics pipeline)
      'warehouse_assigned',
      'ready_for_pickup',
      'logistics_assigned',
      'renewal_order_created',
      // New — staff account events
      'staff_approved',
      'staff_rejected'
    ],
    required: [true, 'Notification type is required']
  },
  message: {
    type: String,
    required: [true, 'Message is required']
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    default: null
  },
  read: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Compound index for efficient unread queries
notificationSchema.index({ userId: 1, read: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
