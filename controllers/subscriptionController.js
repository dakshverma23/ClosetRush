const Subscription = require('../models/Subscription');
const Bundle = require('../models/Bundle');
const User = require('../models/User');
const { calculateBundlePricing } = require('../services/calculator.service');
const ApiError = require('../utils/apiError');

/**
 * Get user's subscriptions
 * GET /api/subscriptions
 */
const getSubscriptions = async (req, res, next) => {
  try {
    const { status, propertyId } = req.query;
    const userId = req.user._id;

    // Build query
    const query = {};

    // Admin can see all subscriptions, others only their own
    if (req.user.userType === 'admin') {
      // Admin sees all
    } else {
      query.userId = userId;
    }

    if (status) {
      query.status = status;
    }

    if (propertyId) {
      query.propertyId = propertyId;
    }

    const subscriptions = await Subscription.find(query)
      .populate('bundleId')
      .populate('userId', 'name email mobile')
      .populate('propertyId', 'name address')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: subscriptions.length,
      subscriptions
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Get subscription by ID
 * GET /api/subscriptions/:id
 */
const getSubscriptionById = async (req, res, next) => {
  try {
    const subscription = await Subscription.findById(req.params.id)
      .populate('bundleId')
      .populate('userId', 'name email mobile')
      .populate('propertyId', 'name address');

    if (!subscription) {
      throw ApiError.notFound('Subscription not found', 'SUBSCRIPTION_NOT_FOUND');
    }

    // Check ownership (unless admin)
    if (req.user.userType !== 'admin' && subscription.userId._id.toString() !== req.user._id.toString()) {
      throw ApiError.forbidden('Access denied to this subscription');
    }

    res.status(200).json({
      success: true,
      subscription
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Create new subscription
 * POST /api/subscriptions
 */
const createSubscription = async (req, res, next) => {
  try {
    const { bundleId, duration, propertyId } = req.body;
    const userId = req.user._id;

    // Validate required fields
    if (!bundleId || !duration) {
      throw ApiError.badRequest('Bundle ID and duration are required');
    }

    // Validate duration
    if (![1, 3, 6, 12].includes(duration)) {
      throw ApiError.badRequest('Invalid duration. Allowed values: 1, 3, 6, 12 months');
    }

    // Get bundle
    const bundle = await Bundle.findById(bundleId);

    if (!bundle) {
      throw ApiError.notFound('Bundle not found', 'BUNDLE_NOT_FOUND');
    }

    if (!bundle.active) {
      throw ApiError.badRequest('Bundle is not active');
    }

    // Check if propertyId is provided for business users
    if (req.user.userType === 'business' && !propertyId) {
      throw ApiError.badRequest('Property ID is required for business users');
    }

    // Verify property ownership if propertyId provided
    if (propertyId) {
      const Property = require('../models/Property');
      const property = await Property.findById(propertyId);

      if (!property) {
        throw ApiError.notFound('Property not found', 'PROPERTY_NOT_FOUND');
      }

      if (property.userId.toString() !== userId.toString() && req.user.userType !== 'admin') {
        throw ApiError.forbidden('Access denied to this property');
      }
    }

    // Calculate pricing
    const pricing = calculateBundlePricing(bundle, duration);

    // Calculate security deposit based on bundle
    const fixedDeposit = bundle.depositAmount || 0;

    // Create subscription
    const subscription = await Subscription.create({
      userId,
      propertyId: propertyId || undefined,
      bundleId,
      duration,
      originalPrice: pricing.originalPrice,
      discount: pricing.discountAmount,
      finalPrice: pricing.finalPrice,
      fixedDeposit,
      status: 'active',
      startDate: new Date()
    });

    // Populate bundle details
    await subscription.populate('bundleId');

    res.status(201).json({
      success: true,
      message: 'Subscription created successfully',
      subscription,
      pricing
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Update subscription
 * PUT /api/subscriptions/:id
 */
const updateSubscription = async (req, res, next) => {
  try {
    const { status, deliveryDate, pickupDate } = req.body;

    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      throw ApiError.notFound('Subscription not found', 'SUBSCRIPTION_NOT_FOUND');
    }

    // Check ownership (unless admin)
    if (req.user.userType !== 'admin' && subscription.userId.toString() !== req.user._id.toString()) {
      throw ApiError.forbidden('Access denied to this subscription');
    }

    // Update fields
    if (status) {
      if (!['active', 'paused', 'cancelled'].includes(status)) {
        throw ApiError.badRequest('Invalid status');
      }
      subscription.status = status;
    }

    if (deliveryDate) {
      subscription.deliveryDate = new Date(deliveryDate);
    }

    if (pickupDate) {
      subscription.pickupDate = new Date(pickupDate);
    }

    await subscription.save();
    await subscription.populate('bundleId');

    res.status(200).json({
      success: true,
      message: 'Subscription updated successfully',
      subscription
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Pause subscription
 * PATCH /api/subscriptions/:id/pause
 */
const pauseSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      throw ApiError.notFound('Subscription not found', 'SUBSCRIPTION_NOT_FOUND');
    }

    // Check ownership
    if (subscription.userId.toString() !== req.user._id.toString() && req.user.userType !== 'admin') {
      throw ApiError.forbidden('Access denied to this subscription');
    }

    if (subscription.status !== 'active') {
      throw ApiError.badRequest('Only active subscriptions can be paused');
    }

    await subscription.pause();
    await subscription.populate('bundleId');

    res.status(200).json({
      success: true,
      message: 'Subscription paused successfully',
      subscription
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Resume subscription
 * PATCH /api/subscriptions/:id/resume
 */
const resumeSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      throw ApiError.notFound('Subscription not found', 'SUBSCRIPTION_NOT_FOUND');
    }

    // Check ownership
    if (subscription.userId.toString() !== req.user._id.toString() && req.user.userType !== 'admin') {
      throw ApiError.forbidden('Access denied to this subscription');
    }

    if (subscription.status !== 'paused') {
      throw ApiError.badRequest('Only paused subscriptions can be resumed');
    }

    await subscription.resume();
    await subscription.populate('bundleId');

    res.status(200).json({
      success: true,
      message: 'Subscription resumed successfully',
      subscription
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Cancel subscription
 * DELETE /api/subscriptions/:id
 */
const cancelSubscription = async (req, res, next) => {
  try {
    const { reason } = req.body;

    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      throw ApiError.notFound('Subscription not found', 'SUBSCRIPTION_NOT_FOUND');
    }

    // Check ownership
    if (subscription.userId.toString() !== req.user._id.toString() && req.user.userType !== 'admin') {
      throw ApiError.forbidden('Access denied to this subscription');
    }

    if (subscription.status === 'cancelled') {
      throw ApiError.badRequest('Subscription is already cancelled');
    }

    await subscription.cancel(reason || 'User requested cancellation');
    await subscription.populate('bundleId');

    res.status(200).json({
      success: true,
      message: 'Subscription cancelled successfully',
      subscription
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSubscriptions,
  getSubscriptionById,
  createSubscription,
  updateSubscription,
  pauseSubscription,
  resumeSubscription,
  cancelSubscription
};
