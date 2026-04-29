const QualityCheck = require('../models/QualityCheck');
const Order = require('../models/Order');
const ApiError = require('../utils/apiError');
const { cloudinary } = require('../config/cloudinary');

/**
 * Submit a quality check report
 * POST /api/quality-checks
 */
const submitQualityCheck = async (req, res, next) => {
  try {
    const { orderId, bundleSummary, bagIds, skuCodes, notes, overallCondition } = req.body;

    // Validate order exists
    const order = await Order.findById(orderId).populate('userId', 'name email');
    if (!order) {
      throw ApiError.notFound('Order not found', 'ORDER_NOT_FOUND');
    }

    // Validate images
    if (!req.files || req.files.length === 0) {
      throw ApiError.badRequest('At least one image is required');
    }

    const imageUrls = req.files.map(file => file.path);

    const qualityCheck = await QualityCheck.create({
      orderId,
      userId: order.userId._id,
      submittedBy: req.user._id,
      bundleSummary,
      bagIds: Array.isArray(bagIds) ? bagIds : (bagIds ? [bagIds] : []),
      skuCodes: Array.isArray(skuCodes) ? skuCodes : (skuCodes ? [skuCodes] : []),
      notes,
      overallCondition: overallCondition || 'good',
      images: imageUrls
    });

    res.status(201).json({
      success: true,
      message: 'Quality check submitted successfully',
      qualityCheck
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all quality checks (admin or warehouse manager)
 * GET /api/quality-checks
 */
const getQualityChecks = async (req, res, next) => {
  try {
    let query = {};

    if (req.user.userType === 'warehouse_manager') {
      query.submittedBy = req.user._id;
    }

    const qualityChecks = await QualityCheck.find(query)
      .populate('orderId', 'status orderedBundles')
      .populate('userId', 'name email')
      .populate('submittedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: qualityChecks.length,
      qualityChecks
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single quality check by ID
 * GET /api/quality-checks/:id
 */
const getQualityCheckById = async (req, res, next) => {
  try {
    const qualityCheck = await QualityCheck.findById(req.params.id)
      .populate('orderId', 'status orderedBundles')
      .populate('userId', 'name email mobile')
      .populate('submittedBy', 'name email');

    if (!qualityCheck) {
      throw ApiError.notFound('Quality check not found', 'QUALITY_CHECK_NOT_FOUND');
    }

    res.status(200).json({
      success: true,
      qualityCheck
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin review a quality check
 * PATCH /api/quality-checks/:id/review
 */
const reviewQualityCheck = async (req, res, next) => {
  try {
    const { adminNotes } = req.body;

    const qualityCheck = await QualityCheck.findById(req.params.id);
    if (!qualityCheck) {
      throw ApiError.notFound('Quality check not found', 'QUALITY_CHECK_NOT_FOUND');
    }

    qualityCheck.reviewedByAdmin = true;
    qualityCheck.adminNotes = adminNotes || '';
    qualityCheck.reviewedAt = new Date();
    await qualityCheck.save();

    res.status(200).json({
      success: true,
      message: 'Quality check reviewed',
      qualityCheck
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitQualityCheck,
  getQualityChecks,
  getQualityCheckById,
  reviewQualityCheck
};
