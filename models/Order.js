const mongoose = require('mongoose');

// Sub-schema: snapshot of a bundle type included in the order at creation time
const orderedBundleSchema = new mongoose.Schema({
  bundleTypeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bundle'
  },
  bundleName: {
    type: String,
    required: [true, 'Bundle name is required']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  }
}, { _id: false });

// Sub-schema: a physical bundle assembled by the pickup member
const builtBundleSchema = new mongoose.Schema({
  bundleId: {
    type: String,
    required: [true, 'Bundle ID is required']   // e.g. CR-1718000000000-0001
  },
  bagId: {
    type: String,
    required: [true, 'Bag ID is required']
  },
  skuCodes: [{ type: String, uppercase: true }]
}, { _id: false });

// Sub-schema: delivery evidence submitted by the pickup member
const deliveryFormSchema = new mongoose.Schema({
  images:       [{ type: String }],              // Cloudinary URLs
  buildingName: { type: String, trim: true },
  floor:        { type: String, trim: true },
  roomNumber:   { type: String, trim: true }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  subscriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription',
    required: [true, 'Subscription ID is required'],
    index: true
  },
  orderedBundles: [orderedBundleSchema],
  builtBundles:   [builtBundleSchema],
  status: {
    type: String,
    enum: ['pending', 'assigned_to_warehouse', 'packed', 'ready_for_pickup', 'assigned_to_logistics', 'out_for_delivery', 'under_review', 'delivered'],
    default: 'pending',
    index: true
  },
  assignedWarehouseManagerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true
  },
  assignedLogisticsPartnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true
  },
  orderType: {
    type: String,
    enum: ['standard', 'renewal'],
    default: 'standard'
  },
  deliveryForm: {
    type: deliveryFormSchema,
    default: null
  }
}, { timestamps: true });

// Compound indexes for role-based queries
orderSchema.index({ userId: 1, status: 1 });
orderSchema.index({ assignedWarehouseManagerId: 1, status: 1 });
orderSchema.index({ assignedLogisticsPartnerId: 1, status: 1 });
orderSchema.index({ subscriptionId: 1, status: 1 });

module.exports = mongoose.model('Order', orderSchema);
