const SubscriptionRequest = require('../models/SubscriptionRequest');
const Bundle = require('../models/Bundle');
const { ApiError } = require('../utils/apiError');

// Create subscription request
exports.createSubscriptionRequest = async (req, res, next) => {
  try {
    const { bundleId, duration, bedConfiguration } = req.body;

    // Validate bundle
    const bundle = await Bundle.findById(bundleId);
    if (!bundle || !bundle.active) {
      throw new ApiError(404, 'Bundle not found or inactive');
    }

    // Calculate pricing
    const subscriptionPrice = bundle.price * duration;
    
    // Get discount based on duration
    let discountPercentage = 0;
    if (duration === 3) discountPercentage = 5;
    else if (duration === 6) discountPercentage = 10;
    else if (duration === 12) discountPercentage = 20;

    const discount = Math.round((subscriptionPrice * discountPercentage) / 100);
    const finalSubscriptionPrice = subscriptionPrice - discount;

    // Calculate fixed deposit
    const fixedDeposit = 
      (bedConfiguration.singleBeds * 500) +
      (bedConfiguration.doubleBeds * 1000) +
      (bedConfiguration.curtainSets * 200);

    const totalAmount = finalSubscriptionPrice + fixedDeposit;

    // Create subscription request
    const request = await SubscriptionRequest.create({
      userId: req.user._id,
      bundleId,
      duration,
      subscriptionPrice,
      discount,
      discountPercentage,
      finalSubscriptionPrice,
      fixedDeposit,
      totalAmount,
      bedConfiguration,
      status: 'pending_payment'
    });

    await request.populate('bundleId');

    res.status(201).json({
      success: true,
      message: 'Subscription request created successfully',
      request
    });
  } catch (error) {
    next(error);
  }
};

// Get subscription request by ID
exports.getSubscriptionRequest = async (req, res, next) => {
  try {
    const request = await SubscriptionRequest.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate('bundleId');

    if (!request) {
      throw new ApiError(404, 'Subscription request not found');
    }

    res.json({
      success: true,
      request
    });
  } catch (error) {
    next(error);
  }
};

// Get user's subscription requests
exports.getUserSubscriptionRequests = async (req, res, next) => {
  try {
    const requests = await SubscriptionRequest.find({
      userId: req.user._id
    })
      .populate('bundleId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: requests.length,
      requests
    });
  } catch (error) {
    next(error);
  }
};

// Update delivery details
exports.updateDeliveryDetails = async (req, res, next) => {
  try {
    const { deliveryAddress, preferredDeliveryDate, specialInstructions } = req.body;

    const request = await SubscriptionRequest.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!request) {
      throw new ApiError(404, 'Subscription request not found');
    }

    if (request.status !== 'pending_payment') {
      throw new ApiError(400, 'Cannot update delivery details for this request');
    }

    request.deliveryAddress = deliveryAddress;
    request.preferredDeliveryDate = preferredDeliveryDate;
    request.specialInstructions = specialInstructions;
    await request.save();

    res.json({
      success: true,
      message: 'Delivery details updated successfully',
      request
    });
  } catch (error) {
    next(error);
  }
};

// Process payment (placeholder for payment gateway integration)
exports.processPayment = async (req, res, next) => {
  try {
    const { paymentMethod, paymentId, status } = req.body;

    const request = await SubscriptionRequest.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!request) {
      throw new ApiError(404, 'Subscription request not found');
    }

    if (request.status !== 'pending_payment') {
      throw new ApiError(400, 'Payment already processed for this request');
    }

    // Update payment details
    request.paymentMethod = paymentMethod;
    request.paymentId = paymentId;
    request.paymentStatus = status === 'completed' ? 'completed' : 'pending';
    request.paymentDate = new Date();
    
    if (status === 'completed') {
      request.status = 'payment_completed';
      
      // Create subscription
      const subscription = await request.createSubscription();
      
      res.json({
        success: true,
        message: 'Payment processed and subscription created successfully',
        request,
        subscription
      });
    } else {
      await request.save();
      
      res.json({
        success: true,
        message: 'Payment initiated successfully',
        request
      });
    }
  } catch (error) {
    next(error);
  }
};

// Cancel subscription request
exports.cancelSubscriptionRequest = async (req, res, next) => {
  try {
    const { reason } = req.body;

    const request = await SubscriptionRequest.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!request) {
      throw new ApiError(404, 'Subscription request not found');
    }

    if (request.status === 'subscription_created') {
      throw new ApiError(400, 'Cannot cancel request after subscription is created');
    }

    request.status = 'cancelled';
    request.cancellationReason = reason;
    request.cancelledAt = new Date();
    await request.save();

    res.json({
      success: true,
      message: 'Subscription request cancelled successfully',
      request
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Get all subscription requests
exports.getAllSubscriptionRequests = async (req, res, next) => {
  try {
    const { status, paymentStatus } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    const requests = await SubscriptionRequest.find(filter)
      .populate('userId', 'name email mobile')
      .populate('bundleId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: requests.length,
      requests
    });
  } catch (error) {
    next(error);
  }
};
