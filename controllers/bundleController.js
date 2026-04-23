const Bundle = require('../models/Bundle');
const Category = require('../models/Category');
const ApiError = require('../utils/apiError');

/**
 * Get all bundles
 * GET /api/bundles
 */
const getAllBundles = async (req, res, next) => {
  try {
    const { active } = req.query;

    // Build query
    const query = {};
    if (active !== undefined) {
      query.active = active === 'true';
    } else {
      // By default, only show active bundles to non-admin users
      if (!req.user || req.user.userType !== 'admin') {
        query.active = true;
      }
    }

    const bundles = await Bundle.find(query)
      .populate('items.category')
      .sort({ createdAt: -1 });

    // Calculate minimum duration for each bundle
    const bundlesWithMinDuration = await Promise.all(
      bundles.map(async (bundle) => {
        const bundleObj = bundle.toObject();
        bundleObj.minimumDuration = await bundle.getMinimumDuration();
        bundleObj.depositPerUnit = await bundle.calculateDeposit();
        return bundleObj;
      })
    );

    res.status(200).json({
      success: true,
      count: bundlesWithMinDuration.length,
      bundles: bundlesWithMinDuration
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Get bundle by ID
 * GET /api/bundles/:id
 */
const getBundleById = async (req, res, next) => {
  try {
    const bundle = await Bundle.findById(req.params.id)
      .populate('items.category');

    if (!bundle) {
      throw ApiError.notFound('Bundle not found', 'BUNDLE_NOT_FOUND');
    }

    const bundleObj = bundle.toObject();
    bundleObj.minimumDuration = await bundle.getMinimumDuration();
    bundleObj.depositPerUnit = await bundle.calculateDeposit();

    res.status(200).json({
      success: true,
      bundle: bundleObj
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Create new bundle (Admin only)
 * POST /api/bundles
 */
const createBundle = async (req, res, next) => {
  try {
    const { name, items, price, securityDeposit, billingCycle, description, image } = req.body;

    // Validate required fields
    if (!name || !price) {
      throw ApiError.badRequest('Name and price are required');
    }

    // Validate price
    if (price < 0) {
      throw ApiError.badRequest('Price must be positive');
    }

    if (securityDeposit !== undefined && securityDeposit < 0) {
      throw ApiError.badRequest('Security deposit must be positive');
    }

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw ApiError.badRequest('At least one item is required');
    }

    // Validate each item
    for (const item of items) {
      if (!item.category || !item.quantity) {
        throw ApiError.badRequest('Each item must have category and quantity');
      }

      // Check if category exists
      const category = await Category.findById(item.category);
      if (!category) {
        throw ApiError.badRequest(`Category ${item.category} not found`);
      }

      if (item.quantity < 1) {
        throw ApiError.badRequest('Item quantity must be at least 1');
      }
    }

    const bundle = await Bundle.create({
      name,
      items,
      price,
      securityDeposit: securityDeposit || 0,
      billingCycle: billingCycle || 'monthly',
      description,
      image: image || ''
    });

    await bundle.populate('items.category');

    res.status(201).json({
      success: true,
      message: 'Bundle created successfully',
      bundle
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Update bundle (Admin only)
 * PUT /api/bundles/:id
 */
const updateBundle = async (req, res, next) => {
  try {
    const { name, items, price, securityDeposit, billingCycle, description, image } = req.body;

    const bundle = await Bundle.findById(req.params.id);

    if (!bundle) {
      throw ApiError.notFound('Bundle not found', 'BUNDLE_NOT_FOUND');
    }

    // Update fields
    if (name) bundle.name = name;
    
    if (items) {
      // Validate items
      if (!Array.isArray(items) || items.length === 0) {
        throw ApiError.badRequest('At least one item is required');
      }

      // Validate each item
      for (const item of items) {
        if (!item.category || !item.quantity) {
          throw ApiError.badRequest('Each item must have category and quantity');
        }

        // Check if category exists
        const category = await Category.findById(item.category);
        if (!category) {
          throw ApiError.badRequest(`Category ${item.category} not found`);
        }

        if (item.quantity < 1) {
          throw ApiError.badRequest('Item quantity must be at least 1');
        }
      }

      bundle.items = items;
    }
    
    if (price !== undefined) {
      if (price < 0) {
        throw ApiError.badRequest('Price must be positive');
      }
      bundle.price = price;
    }

    if (securityDeposit !== undefined) {
      if (securityDeposit < 0) {
        throw ApiError.badRequest('Security deposit must be positive');
      }
      bundle.securityDeposit = securityDeposit;
    }
    
    if (billingCycle) bundle.billingCycle = billingCycle;
    if (description !== undefined) bundle.description = description;
    if (image !== undefined) bundle.image = image;

    await bundle.save();
    await bundle.populate('items.category');

    res.status(200).json({
      success: true,
      message: 'Bundle updated successfully',
      bundle
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Toggle bundle active status (Admin only)
 * PATCH /api/bundles/:id/status
 */
const toggleBundleStatus = async (req, res, next) => {
  try {
    const { active } = req.body;

    if (active === undefined) {
      throw ApiError.badRequest('Active status is required');
    }

    const bundle = await Bundle.findById(req.params.id);

    if (!bundle) {
      throw ApiError.notFound('Bundle not found', 'BUNDLE_NOT_FOUND');
    }

    bundle.active = active;
    await bundle.save();
    await bundle.populate('items.category');

    res.status(200).json({
      success: true,
      message: `Bundle ${active ? 'activated' : 'deactivated'} successfully`,
      bundle
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Delete bundle (Admin only)
 * DELETE /api/bundles/:id
 */
const deleteBundle = async (req, res, next) => {
  try {
    const bundle = await Bundle.findById(req.params.id);

    if (!bundle) {
      throw ApiError.notFound('Bundle not found', 'BUNDLE_NOT_FOUND');
    }

    // Check if bundle is used in any active subscriptions
    const Subscription = require('../models/Subscription');
    const activeSubscriptions = await Subscription.countDocuments({
      bundleId: req.params.id,
      status: 'active'
    });

    if (activeSubscriptions > 0) {
      throw ApiError.conflict(
        'Cannot delete bundle with active subscriptions. Deactivate it instead.',
        'BUNDLE_HAS_SUBSCRIPTIONS'
      );
    }

    await bundle.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Bundle deleted successfully'
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllBundles,
  getBundleById,
  createBundle,
  updateBundle,
  toggleBundleStatus,
  deleteBundle
};
