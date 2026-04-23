const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { authenticate } = require('../middleware/auth');

/**
 * @route   GET /api/subscriptions
 * @desc    Get user's subscriptions (or all for admin)
 * @access  Private
 */
router.get('/', authenticate, subscriptionController.getSubscriptions);

/**
 * @route   GET /api/subscriptions/:id
 * @desc    Get subscription by ID
 * @access  Private
 */
router.get('/:id', authenticate, subscriptionController.getSubscriptionById);

/**
 * @route   POST /api/subscriptions
 * @desc    Create new subscription
 * @access  Private
 */
router.post('/', authenticate, subscriptionController.createSubscription);

/**
 * @route   PUT /api/subscriptions/:id
 * @desc    Update subscription
 * @access  Private (owner or admin)
 */
router.put('/:id', authenticate, subscriptionController.updateSubscription);

/**
 * @route   PATCH /api/subscriptions/:id/pause
 * @desc    Pause subscription
 * @access  Private (owner or admin)
 */
router.patch('/:id/pause', authenticate, subscriptionController.pauseSubscription);

/**
 * @route   PATCH /api/subscriptions/:id/resume
 * @desc    Resume subscription
 * @access  Private (owner or admin)
 */
router.patch('/:id/resume', authenticate, subscriptionController.resumeSubscription);

/**
 * @route   DELETE /api/subscriptions/:id
 * @desc    Cancel subscription
 * @access  Private (owner or admin)
 */
router.delete('/:id', authenticate, subscriptionController.cancelSubscription);

module.exports = router;
