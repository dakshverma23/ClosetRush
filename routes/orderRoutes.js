const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { requireAdmin, requireWarehouseManager, requireLogisticsPartner } = require('../middleware/rbac');
const { upload } = require('../config/cloudinary');
const ctrl = require('../controllers/orderFulfillmentController');

// GET /api/orders — role-scoped, any authenticated user
router.get('/', authenticate, ctrl.getOrders);

// POST /api/orders/:id/assign-warehouse — admin only
router.post('/:id/assign-warehouse', authenticate, requireAdmin, ctrl.assignWarehouseManager);

// POST /api/orders/:id/build-bundles — warehouse manager only
router.post('/:id/build-bundles', authenticate, requireWarehouseManager, ctrl.buildBundles);

// PATCH /api/orders/:id/ready-for-pickup — warehouse manager only
router.patch('/:id/ready-for-pickup', authenticate, requireWarehouseManager, ctrl.markReadyForPickup);

// POST /api/orders/:id/assign-logistics — admin only
router.post('/:id/assign-logistics', authenticate, requireAdmin, ctrl.assignLogisticsPartner);

// POST /api/orders/:id/assign-logistics-wh — warehouse manager can also assign logistics
router.post('/:id/assign-logistics-wh', authenticate, requireWarehouseManager, ctrl.assignLogisticsPartner);

// PATCH /api/orders/:id/out-for-delivery — logistics partner only
router.patch('/:id/out-for-delivery', authenticate, requireLogisticsPartner, ctrl.markOutForDelivery);

// POST /api/orders/:id/delivery-form — logistics partner only, with image upload
router.post('/:id/delivery-form', authenticate, requireLogisticsPartner, upload.array('images', 10), ctrl.submitDeliveryForm);

// PATCH /api/orders/:id/approve-delivery — admin only
router.patch('/:id/approve-delivery', authenticate, requireAdmin, ctrl.approveDelivery);

// PATCH /api/orders/:id/reject-delivery — admin only
router.patch('/:id/reject-delivery', authenticate, requireAdmin, ctrl.rejectDelivery);

module.exports = router;
