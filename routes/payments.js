const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticate } = require('../middleware/auth');

/**
 * @route   POST /api/payments/create-order
 * @desc    Create Razorpay order
 * @access  Private
 */
router.post('/create-order', authenticate, paymentController.createOrder);

/**
 * @route   POST /api/payments/verify
 * @desc    Verify Razorpay payment signature
 * @access  Private
 */
router.post('/verify', authenticate, paymentController.verifyPayment);

/**
 * @route   GET /api/payments/:paymentId
 * @desc    Get payment details
 * @access  Private
 */
router.get('/:paymentId', authenticate, paymentController.getPaymentDetails);

/**
 * @route   POST /api/payments/refund
 * @desc    Refund a payment (Admin only)
 * @access  Private (Admin)
 */
router.post('/refund', authenticate, paymentController.refundPayment);

/**
 * @route   POST /api/payments/webhook
 * @desc    Handle Razorpay webhooks
 * @access  Public (but verified)
 */
router.post('/webhook', paymentController.handleWebhook);

module.exports = router;
