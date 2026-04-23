const express = require('express');
const router = express.Router();
const {
  createSubscriptionRequest,
  getSubscriptionRequest,
  getUserSubscriptionRequests,
  updateDeliveryDetails,
  processPayment,
  cancelSubscriptionRequest,
  getAllSubscriptionRequests
} = require('../controllers/subscriptionRequestController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

// User routes
router.post('/', authenticate, createSubscriptionRequest);
router.get('/', authenticate, getUserSubscriptionRequests);
router.get('/:id', authenticate, getSubscriptionRequest);
router.patch('/:id/delivery', authenticate, updateDeliveryDetails);
router.post('/:id/payment', authenticate, processPayment);
router.delete('/:id', authenticate, cancelSubscriptionRequest);

// Admin routes
router.get('/admin/all', authenticate, requireRole('admin'), getAllSubscriptionRequests);

module.exports = router;
