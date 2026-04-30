const Order = require('../models/Order');
const User = require('../models/User');
const InventoryItem = require('../models/InventoryItem');
const ApiError = require('../utils/apiError');
const { generateBundleId } = require('../constants/bundleIdFormat');
const {
  notifyWarehouseAssigned,
  notifyOrderPacked,
  notifyReadyForPickup,
  notifyLogisticsAssigned,
  notifyOutForDelivery,
  notifyDeliveryUnderReview,
  notifyOrderDelivered,
  notifyDeliveryRejected
} = require('../services/notificationService');

// ── Status transition map (8-stage lifecycle) ─────────────────────────────────
const VALID_TRANSITIONS = {
  pending:                'assigned_to_warehouse',
  assigned_to_warehouse:  'packed',
  packed:                 'ready_for_pickup',
  ready_for_pickup:       'assigned_to_logistics',
  assigned_to_logistics:  'out_for_delivery',
  out_for_delivery:       'under_review',
  under_review:           'delivered'
};

/**
 * Guard that the order is currently in the expected status before transitioning.
 */
const guardTransition = (order, expectedCurrent) => {
  if (order.status !== expectedCurrent) {
    throw ApiError.badRequest(
      `Order cannot be updated from status '${order.status}'. Expected status: '${expectedCurrent}'.`,
      { currentStatus: order.status, expectedStatus: expectedCurrent }
    );
  }
};

// ── Handlers ──────────────────────────────────────────────────────────────────

/**
 * Get orders (role-scoped)
 * GET /api/orders
 */
const getOrders = async (req, res, next) => {
  try {
    let query = {};

    if (req.user.userType === 'admin') {
      query = {};
    } else if (req.user.userType === 'warehouse_manager') {
      query = { assignedWarehouseManagerId: req.user._id };
    } else if (req.user.userType === 'logistics_partner') {
      query = { assignedLogisticsPartnerId: req.user._id };
    } else {
      query = { userId: req.user._id };
    }

    const orders = await Order.find(query)
      .populate('userId', 'name email')
      .populate('assignedWarehouseManagerId', 'name email')
      .populate('assignedLogisticsPartnerId', 'name email')
      .populate('subscriptionId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Assign an order to a warehouse manager
 * POST /api/orders/:id/assign-warehouse
 */
const assignWarehouseManager = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) throw ApiError.notFound('Order not found', 'ORDER_NOT_FOUND');

    guardTransition(order, 'pending');

    const { warehouseManagerId } = req.body;
    const user = await User.findById(warehouseManagerId);
    if (!user) throw ApiError.notFound('Warehouse manager not found', 'USER_NOT_FOUND');

    if (user.userType !== 'warehouse_manager' || user.warehouseManagerStatus !== 'approved') {
      throw ApiError.badRequest('Selected user is not an approved warehouse manager');
    }

    order.assignedWarehouseManagerId = warehouseManagerId;
    order.status = 'assigned_to_warehouse';
    await order.save();

    await notifyWarehouseAssigned(warehouseManagerId, order);

    res.status(200).json({ success: true, message: 'Order assigned to warehouse manager', order });
  } catch (error) {
    next(error);
  }
};

/**
 * Build physical bundles for an assigned order
 * POST /api/orders/:id/build-bundles
 */
const buildBundles = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) throw ApiError.notFound('Order not found', 'ORDER_NOT_FOUND');

    guardTransition(order, 'assigned_to_warehouse');

    if (order.assignedWarehouseManagerId.toString() !== req.user._id.toString()) {
      throw ApiError.forbidden('You are not assigned to this order');
    }

    const { bundles, bagId } = req.body;

    // bagId is order-level — required
    if (!bagId || typeof bagId !== 'string' || bagId.trim() === '') {
      throw ApiError.badRequest('bagId is required for the order');
    }

    if (!bundles || !Array.isArray(bundles) || bundles.length === 0) {
      throw ApiError.badRequest('bundles must be a non-empty array');
    }

    for (const bundle of bundles) {
      if (!bundle.skuCodes || !Array.isArray(bundle.skuCodes) || bundle.skuCodes.length === 0) {
        throw ApiError.badRequest('Each bundle must have a non-empty skuCodes array');
      }
      for (const skuCode of bundle.skuCodes) {
        const item = await InventoryItem.findOne({ skuCode: skuCode.toUpperCase() });
        if (!item || item.status !== 'in_stock') {
          throw ApiError.badRequest(`SKU code '${skuCode}' is not available or not in stock`);
        }
      }
    }

    const builtBundles = bundles.map((b, index) => ({
      bundleId: generateBundleId(index + 1),
      skuCodes: b.skuCodes.map(s => s.toUpperCase())
    }));

    order.builtBundles = builtBundles;
    order.bagId = bagId.trim();
    order.status = 'packed';
    await order.save();

    // ── Auto-sync inventory items — write bundleBuiltId and bagMarking ────
    for (const bundle of builtBundles) {
      for (const skuCode of bundle.skuCodes) {
        await InventoryItem.findOneAndUpdate(
          { skuCode: skuCode.toUpperCase() },
          {
            $set: {
              bundleBuiltId: bundle.bundleId,
              bagMarking: bagId.trim(),   // order-level bag ID
              orderId: order._id,
              status: 'in_stock',
              dispatchDate: null
            }
          },
          { new: true }
        );
      }
    }

    const admin = await User.findOne({ userType: 'admin' });
    await notifyOrderPacked(order.userId, admin._id, order);

    res.status(200).json({ success: true, message: 'Bundles built. Order is now packed.', order });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark a packed order as ready for pickup (warehouse manager)
 * PATCH /api/orders/:id/ready-for-pickup
 */
const markReadyForPickup = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) throw ApiError.notFound('Order not found', 'ORDER_NOT_FOUND');

    guardTransition(order, 'packed');

    if (order.assignedWarehouseManagerId.toString() !== req.user._id.toString()) {
      throw ApiError.forbidden('You are not assigned to this order');
    }

    order.status = 'ready_for_pickup';
    await order.save();

    const admin = await User.findOne({ userType: 'admin' });
    await notifyReadyForPickup(admin._id, order);

    res.status(200).json({ success: true, message: 'Order marked as ready for pickup.', order });
  } catch (error) {
    next(error);
  }
};

/**
 * Assign a ready-for-pickup order to a logistics partner (admin or warehouse manager)
 * POST /api/orders/:id/assign-logistics
 * POST /api/orders/:id/assign-logistics-wh
 */
const assignLogisticsPartner = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) throw ApiError.notFound('Order not found', 'ORDER_NOT_FOUND');

    guardTransition(order, 'ready_for_pickup');

    // Warehouse manager can only assign logistics for orders assigned to them
    if (req.user.userType === 'warehouse_manager') {
      if (order.assignedWarehouseManagerId?.toString() !== req.user._id.toString()) {
        throw ApiError.forbidden('You are not assigned to this order');
      }
    }

    const { logisticsPartnerId } = req.body;
    const user = await User.findById(logisticsPartnerId);
    if (!user) throw ApiError.notFound('Logistics partner not found', 'USER_NOT_FOUND');

    if (user.userType !== 'logistics_partner' || user.logisticsPartnerStatus !== 'approved') {
      throw ApiError.badRequest('Selected user is not an approved logistics partner');
    }

    order.assignedLogisticsPartnerId = logisticsPartnerId;
    order.status = 'assigned_to_logistics';
    await order.save();

    await order.populate('userId', 'name address');
    await notifyLogisticsAssigned(logisticsPartnerId, order);

    res.status(200).json({ success: true, message: 'Order assigned to logistics partner', order });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark an assigned order as out for delivery (logistics partner)
 * PATCH /api/orders/:id/out-for-delivery
 */
const markOutForDelivery = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) throw ApiError.notFound('Order not found', 'ORDER_NOT_FOUND');

    guardTransition(order, 'assigned_to_logistics');

    if (order.assignedLogisticsPartnerId.toString() !== req.user._id.toString()) {
      throw ApiError.forbidden('You are not assigned to this order');
    }

    order.status = 'out_for_delivery';
    await order.save();

    // ── Mark all SKUs in this order as out_of_stock with dispatch date ────
    const dispatchDate = new Date();
    for (const bundle of order.builtBundles || []) {
      for (const skuCode of bundle.skuCodes || []) {
        await InventoryItem.findOneAndUpdate(
          { skuCode: skuCode.toUpperCase() },
          { $set: { status: 'out_of_stock', dispatchDate } }
        );
      }
    }

    const admin = await User.findOne({ userType: 'admin' });
    await notifyOutForDelivery(order.userId, admin._id, order);

    res.status(200).json({ success: true, message: 'Order marked as out for delivery.', order });
  } catch (error) {
    next(error);
  }
};

/**
 * Submit delivery form with images and location details (logistics partner)
 * POST /api/orders/:id/delivery-form
 */
const submitDeliveryForm = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) throw ApiError.notFound('Order not found', 'ORDER_NOT_FOUND');

    guardTransition(order, 'out_for_delivery');

    if (order.assignedLogisticsPartnerId.toString() !== req.user._id.toString()) {
      throw ApiError.forbidden('You are not assigned to this order');
    }

    const { buildingName, floor, roomNumber } = req.body;
    if (!buildingName || !floor || !roomNumber) {
      throw ApiError.badRequest('buildingName, floor, and roomNumber are required');
    }
    if (!req.files || req.files.length === 0) {
      throw ApiError.badRequest('At least one delivery image is required');
    }

    const imageUrls = req.files.map(f => f.path);
    order.deliveryForm = { images: imageUrls, buildingName, floor, roomNumber };
    order.status = 'under_review';
    await order.save();

    const admin = await User.findOne({ userType: 'admin' });
    await notifyDeliveryUnderReview(admin._id, order);

    res.status(200).json({ success: true, message: 'Delivery form submitted. Awaiting admin review.', order });
  } catch (error) {
    next(error);
  }
};

/**
 * Approve a delivery (admin)
 * PATCH /api/orders/:id/approve-delivery
 */
const approveDelivery = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) throw ApiError.notFound('Order not found', 'ORDER_NOT_FOUND');

    guardTransition(order, 'under_review');

    order.status = 'delivered';
    await order.save();

    await notifyOrderDelivered(order.userId, order);

    res.status(200).json({ success: true, message: 'Delivery approved. Order marked as delivered.', order });
  } catch (error) {
    next(error);
  }
};

/**
 * Reject a delivery and revert to out_for_delivery (admin)
 * PATCH /api/orders/:id/reject-delivery
 */
const rejectDelivery = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) throw ApiError.notFound('Order not found', 'ORDER_NOT_FOUND');

    guardTransition(order, 'under_review');

    const { rejectionReason } = req.body;
    if (!rejectionReason || !rejectionReason.trim()) {
      throw ApiError.badRequest('Rejection reason is required');
    }

    order.status = 'out_for_delivery';
    await order.save();

    await notifyDeliveryRejected(order.assignedLogisticsPartnerId, order, rejectionReason);

    res.status(200).json({ success: true, message: 'Delivery rejected. Order reverted to out for delivery.', order });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOrders,
  assignWarehouseManager,
  buildBundles,
  markReadyForPickup,
  assignLogisticsPartner,
  markOutForDelivery,
  submitDeliveryForm,
  approveDelivery,
  rejectDelivery
};
