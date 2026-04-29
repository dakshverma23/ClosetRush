const express = require('express');
const router = express.Router();
const InventoryItem  = require('../models/InventoryItem');
const PickupReport   = require('../models/PickupReport');
const Subscription   = require('../models/Subscription');
const { authenticate } = require('../middleware/auth');
const { requireAdmin, requireWarehouseManager } = require('../middleware/rbac');

// ─── Subscriptions / Orders view (for inventory panel) ───────────────────────

// GET all subscriptions with full user + bundle + address details
router.get('/orders', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { status, bundleOrderId, userId } = req.query;
    const filter = {};
    if (status)        filter.status        = status;
    if (bundleOrderId) filter.bundleOrderId = new RegExp(bundleOrderId, 'i');
    if (userId)        filter.userId        = userId;

    const orders = await Subscription.find(filter)
      .populate('userId',   'name email mobile address userType')
      .populate('bundleId', 'name price billingCycle')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: orders.length, orders });
  } catch (err) { next(err); }
});


// GET all items (admin or warehouse manager)
router.get('/items', authenticate, async (req, res, next) => {
  try {
    const { status, pgName, pincode, bundleId } = req.query;
    const filter = {};
    if (status)   filter.status   = status;
    if (pgName)   filter.pgName   = new RegExp(pgName, 'i');
    if (pincode)  filter.pincode  = pincode;
    if (bundleId) filter.bundleId = bundleId;

    // Warehouse managers only see items linked to their orders
    if (req.user.userType === 'warehouse_manager') {
      const Order = require('../models/Order');
      const myOrders = await Order.find({ assignedWarehouseManagerId: req.user._id }).select('_id');
      const orderIds = myOrders.map(o => o._id);
      filter.orderId = { $in: orderIds };
    } else if (req.user.userType !== 'admin') {
      return res.status(403).json({ error: { message: 'Access denied' } });
    }

    const items = await InventoryItem.find(filter)
      .populate('bundleId', 'name')
      .populate('categoryId', 'name')
      .populate('assignedTo.userId', 'name email')
      .populate('orderId', 'userId status')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: items.length, items });
  } catch (err) { next(err); }
});

// GET single item
router.get('/items/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const item = await InventoryItem.findById(req.params.id)
      .populate('bundleId', 'name')
      .populate('categoryId', 'name')
      .populate('assignedTo.userId', 'name email');
    if (!item) return res.status(404).json({ error: { message: 'Item not found' } });
    res.json({ success: true, item });
  } catch (err) { next(err); }
});

// POST create item (admin)
router.post('/items', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const item = await InventoryItem.create(req.body);
    res.status(201).json({ success: true, item });
  } catch (err) { next(err); }
});

// PUT update item (admin)
router.put('/items/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const item = await InventoryItem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ error: { message: 'Item not found' } });
    res.json({ success: true, item });
  } catch (err) { next(err); }
});

// DELETE item (admin)
router.delete('/items/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    await InventoryItem.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Item deleted' });
  } catch (err) { next(err); }
});

// GET PG-wise SKU distribution summary
router.get('/pg-summary', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const summary = await InventoryItem.aggregate([
      { $group: {
        _id: { pgName: '$pgName', area: '$area', pincode: '$pincode' },
        totalItems: { $sum: 1 },
        statuses: { $push: '$status' },
        skus: { $push: '$skuCode' }
      }},
      { $sort: { '_id.pgName': 1 } }
    ]);
    res.json({ success: true, summary });
  } catch (err) { next(err); }
});

// GET stats overview
router.get('/stats', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const [statusCounts, conditionCounts, total] = await Promise.all([
      InventoryItem.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      InventoryItem.aggregate([{ $group: { _id: '$condition', count: { $sum: 1 } } }]),
      InventoryItem.countDocuments()
    ]);
    res.json({ success: true, total, statusCounts, conditionCounts });
  } catch (err) { next(err); }
});

// ─── Pickup Reports ───────────────────────────────────────────────────────────

// GET all reports (admin)
router.get('/reports', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { pgName, verified, skuCode } = req.query;
    const filter = {};
    if (pgName)   filter.pgName = new RegExp(pgName, 'i');
    if (skuCode)  filter.skuCode = skuCode.toUpperCase();
    if (verified !== undefined) filter.verifiedByAdmin = verified === 'true';

    const reports = await PickupReport.find(filter)
      .populate('inventoryItemId', 'skuCode bagMarking')
      .populate('bundleId', 'name')
      .populate('submittedBy', 'name email')
      .sort({ submittedAt: -1 });

    res.json({ success: true, count: reports.length, reports });
  } catch (err) { next(err); }
});

// GET my own reports (warehouse manager — scoped to submittedBy)
router.get('/my-reports', authenticate, requireWarehouseManager, async (req, res, next) => {
  try {
    const reports = await PickupReport.find({ submittedBy: req.user._id })
      .populate('inventoryItemId', 'skuCode bagMarking')
      .populate('bundleId', 'name')
      .sort({ submittedAt: -1 });

    res.json({ success: true, count: reports.length, reports });
  } catch (err) { next(err); }
});

// GET single report
router.get('/reports/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const report = await PickupReport.findById(req.params.id)
      .populate('inventoryItemId')
      .populate('bundleId', 'name')
      .populate('submittedBy', 'name email');
    if (!report) return res.status(404).json({ error: { message: 'Report not found' } });
    res.json({ success: true, report });
  } catch (err) { next(err); }
});

// POST submit pickup report (authenticated warehouse manager)
router.post('/reports', authenticate, requireWarehouseManager, async (req, res, next) => {
  try {
    const report = await PickupReport.create({
      ...req.body,
      submittedBy: req.user._id,
      submittedAt: new Date()
    });

    // Update inventory item status to pickup_pending
    if (req.body.inventoryItemId) {
      await InventoryItem.findByIdAndUpdate(req.body.inventoryItemId, {
        status: 'pickup_pending',
        pickedUpAt: new Date(),
        condition: mapDirtyToCondition(req.body.dirtyLevel)
      });
    }

    res.status(201).json({ success: true, report });
  } catch (err) { next(err); }
});

// PATCH verify report (admin)
router.patch('/reports/:id/verify', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const report = await PickupReport.findByIdAndUpdate(
      req.params.id,
      { verifiedByAdmin: true, adminNotes: req.body.adminNotes },
      { new: true }
    );
    res.json({ success: true, report });
  } catch (err) { next(err); }
});

// Helper
function mapDirtyToCondition(level) {
  if (level <= 2) return 'good';
  if (level <= 5) return 'fair';
  if (level <= 7) return 'worn';
  return 'damaged';
}

module.exports = router;
