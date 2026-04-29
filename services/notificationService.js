const Notification = require('../models/Notification');

const createNotification = async (userId, type, message, orderId = null) => {
  return Notification.create({ userId, type, message, orderId });
};

const notifyOrderAssigned = async (pickupMemberId, order) => {
  await createNotification(
    pickupMemberId,
    'order_assigned',
    `You have been assigned a new order (Subscription: ${order.subscriptionId}). Please pick up from the warehouse.`,
    order._id
  );
};

const notifyOrderPacked = async (userId, adminId, order) => {
  await Promise.all([
    createNotification(userId, 'order_packed', `Your order has been packed and is ready for delivery.`, order._id),
    createNotification(adminId, 'order_packed', `Order for user ${order.userId} has been packed.`, order._id)
  ]);
};

const notifyOutForDelivery = async (userId, adminId, order) => {
  await Promise.all([
    createNotification(userId, 'out_for_delivery', `Your order is out for delivery!`, order._id),
    createNotification(adminId, 'out_for_delivery', `Order for user ${order.userId} is out for delivery.`, order._id)
  ]);
};

const notifyDeliveryUnderReview = async (adminId, order) => {
  await createNotification(
    adminId,
    'delivery_under_review',
    `A delivery form has been submitted and is awaiting your review.`,
    order._id
  );
};

const notifyOrderDelivered = async (userId, order) => {
  await createNotification(
    userId,
    'order_delivered',
    `Your order has been delivered successfully!`,
    order._id
  );
};

const notifyDeliveryRejected = async (logisticsPartnerId, order, reason) => {
  await createNotification(
    logisticsPartnerId,
    'delivery_rejected',
    `Your delivery submission was rejected. Reason: ${reason}. Please re-submit the delivery form.`,
    order._id
  );
};

// ── New helpers for warehouse/logistics pipeline ──────────────────────────────

const notifyWarehouseAssigned = async (warehouseManagerId, order) => {
  await createNotification(
    warehouseManagerId,
    'warehouse_assigned',
    `Order #${order._id.toString().slice(-8)} has been assigned to you for packing.`,
    order._id
  );
};

const notifyReadyForPickup = async (adminId, order) => {
  await createNotification(
    adminId,
    'ready_for_pickup',
    `Order #${order._id.toString().slice(-8)} is packed and ready for logistics assignment.`,
    order._id
  );
};

const notifyLogisticsAssigned = async (logisticsPartnerId, order) => {
  const bundleInfo = (order.builtBundles || [])
    .map(b => `Bundle ID: ${b.bundleId}, Bag ID: ${b.bagId}`)
    .join('; ') || 'Bundle details pending';
  await createNotification(
    logisticsPartnerId,
    'logistics_assigned',
    `Order #${order._id.toString().slice(-8)} has been assigned to you for delivery. ${bundleInfo}.`,
    order._id
  );
};

const notifyRenewalOrderCreated = async (adminId, order) => {
  await createNotification(
    adminId,
    'renewal_order_created',
    `A renewal order has been auto-created for subscription #${order.subscriptionId?.toString().slice(-8) || order.subscriptionId}. Please assign a warehouse manager.`,
    order._id
  );
};

// ── Staff account event helpers ───────────────────────────────────────────────

const notifyWarehouseManagerApproved = async (userId) => {
  await createNotification(
    userId,
    'staff_approved',
    'Your Warehouse Manager account has been approved. You can now log in.',
    null
  );
};

const notifyWarehouseManagerRejected = async (userId, reason) => {
  await createNotification(
    userId,
    'staff_rejected',
    `Your Warehouse Manager account registration was rejected. Reason: ${reason}.`,
    null
  );
};

const notifyLogisticsPartnerApproved = async (userId) => {
  await createNotification(
    userId,
    'staff_approved',
    'Your Logistics Partner account has been approved. You can now log in.',
    null
  );
};

const notifyLogisticsPartnerRejected = async (userId, reason) => {
  await createNotification(
    userId,
    'staff_rejected',
    `Your Logistics Partner account registration was rejected. Reason: ${reason}.`,
    null
  );
};

module.exports = {
  createNotification,
  notifyOrderAssigned,
  notifyOrderPacked,
  notifyOutForDelivery,
  notifyDeliveryUnderReview,
  notifyOrderDelivered,
  notifyDeliveryRejected,
  // New
  notifyWarehouseAssigned,
  notifyReadyForPickup,
  notifyLogisticsAssigned,
  notifyRenewalOrderCreated,
  notifyWarehouseManagerApproved,
  notifyWarehouseManagerRejected,
  notifyLogisticsPartnerApproved,
  notifyLogisticsPartnerRejected
};
