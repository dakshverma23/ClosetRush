const QualityCheck = require('../models/QualityCheck');
const Order = require('../models/Order');
const ApiError = require('../utils/apiError');
const { cloudinary } = require('../config/cloudinary');

/**
 * Submit a quality check report with per-SKU photos
 * POST /api/quality-checks
 * Body (multipart): orderId, notes, overallCondition, bagId
 *   + skuCodes[] (array of SKU codes)
 *   + images (files, named as "sku_<SKUCODE>_<index>" or just flat array)
 *
 * Frontend sends: for each SKU, files named `sku_SKUCODE` so we can group them.
 * Falls back to flat images array if no SKU-named files.
 */
const submitQualityCheck = async (req, res, next) => {
  try {
    const { orderId, notes, overallCondition, bagId, skuPhotosJson } = req.body;

    const order = await Order.findById(orderId).populate('userId', 'name email');
    if (!order) throw ApiError.notFound('Order not found', 'ORDER_NOT_FOUND');

    if (!req.files || req.files.length === 0) {
      throw ApiError.badRequest('At least one photo is required');
    }

    // Parse per-SKU photo grouping from skuPhotosJson if provided
    // skuPhotosJson: JSON array of { skuCode, fieldName } mappings
    let skuPhotos = [];
    const allImageUrls = req.files.map(f => f.path);

    if (skuPhotosJson) {
      try {
        const mapping = JSON.parse(skuPhotosJson); // [{ skuCode, count }]
        let fileIdx = 0;
        for (const entry of mapping) {
          const photos = allImageUrls.slice(fileIdx, fileIdx + entry.count);
          fileIdx += entry.count;
          if (photos.length > 0) {
            skuPhotos.push({ skuCode: entry.skuCode.toUpperCase(), photos });
          }
        }
      } catch {
        // fallback: no per-SKU grouping
      }
    }

    const bundleSummary = (order.orderedBundles || [])
      .map(b => `${b.quantity}x ${b.bundleName}`)
      .join(', ');

    const qualityCheck = await QualityCheck.create({
      orderId,
      userId: order.userId._id,
      submittedBy: req.user._id,
      bundleSummary,
      bagId: bagId || order.bagId || '',
      skuPhotos,
      images: allImageUrls,   // flat list for backward compat
      notes,
      overallCondition: overallCondition || 'good'
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
 * Get quality checks (admin sees all, warehouse manager sees own)
 * GET /api/quality-checks
 */
const getQualityChecks = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.userType === 'warehouse_manager') {
      query.submittedBy = req.user._id;
    }

    const qualityChecks = await QualityCheck.find(query)
      .populate('orderId', 'status orderedBundles bagId')
      .populate('userId', 'name email')
      .populate('submittedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: qualityChecks.length, qualityChecks });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single quality check
 * GET /api/quality-checks/:id
 */
const getQualityCheckById = async (req, res, next) => {
  try {
    const qualityCheck = await QualityCheck.findById(req.params.id)
      .populate('orderId', 'status orderedBundles bagId')
      .populate('userId', 'name email mobile')
      .populate('submittedBy', 'name email');

    if (!qualityCheck) throw ApiError.notFound('Quality check not found');

    res.status(200).json({ success: true, qualityCheck });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin reviews a quality check
 * PATCH /api/quality-checks/:id/review
 */
const reviewQualityCheck = async (req, res, next) => {
  try {
    const { adminNotes } = req.body;
    const qualityCheck = await QualityCheck.findById(req.params.id);
    if (!qualityCheck) throw ApiError.notFound('Quality check not found');

    qualityCheck.reviewedByAdmin = true;
    qualityCheck.adminNotes = adminNotes || '';
    qualityCheck.reviewedAt = new Date();
    await qualityCheck.save();

    res.status(200).json({ success: true, message: 'Quality check reviewed', qualityCheck });
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
