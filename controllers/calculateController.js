const { calculateFixedDeposit, calculatePricing, getDiscountTiers, getPricingConfig } = require('../services/calculator.service');
const Bundle = require('../models/Bundle');
const ApiError = require('../utils/apiError');

/**
 * Calculate fixed deposit
 * POST /api/calculate/deposit
 */
const calculateDeposit = async (req, res, next) => {
  try {
    const { singleBeds, doubleBeds, curtainSets } = req.body;

    // Validate input
    if (singleBeds === undefined && doubleBeds === undefined && curtainSets === undefined) {
      throw ApiError.badRequest('At least one quantity must be provided');
    }

    // Calculate deposit
    const deposit = calculateFixedDeposit({
      singleBeds: singleBeds || 0,
      doubleBeds: doubleBeds || 0,
      curtainSets: curtainSets || 0
    });

    res.status(200).json({
      success: true,
      deposit,
      breakdown: {
        singleBeds: singleBeds || 0,
        doubleBeds: doubleBeds || 0,
        curtainSets: curtainSets || 0,
        singleBedDeposit: (singleBeds || 0) * 500,
        doubleBedDeposit: (doubleBeds || 0) * 1000,
        curtainSetDeposit: (curtainSets || 0) * 200
      }
    });

  } catch (error) {
    if (error.message === 'Quantities cannot be negative') {
      next(ApiError.badRequest(error.message));
    } else {
      next(error);
    }
  }
};

/**
 * Calculate subscription pricing with discount
 * POST /api/calculate/pricing
 */
const calculateSubscriptionPricing = async (req, res, next) => {
  try {
    const { bundleId, duration } = req.body;

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

    // Calculate pricing
    const pricing = calculatePricing(bundle.price, duration);

    res.status(200).json({
      success: true,
      bundle: {
        id: bundle._id,
        name: bundle.name,
        basePrice: bundle.price
      },
      pricing: {
        duration,
        basePrice: pricing.basePrice,
        originalPrice: pricing.originalPrice,
        discountPercentage: pricing.discountPercentage,
        discountAmount: pricing.discountAmount,
        finalPrice: pricing.finalPrice,
        monthlyEquivalent: pricing.monthlyEquivalent
      }
    });

  } catch (error) {
    if (error.message.includes('Invalid subscription duration')) {
      next(ApiError.badRequest(error.message));
    } else {
      next(error);
    }
  }
};

/**
 * Get discount tiers
 * GET /api/calculate/discounts
 */
const getDiscounts = async (req, res, next) => {
  try {
    const discounts = getDiscountTiers();

    res.status(200).json({
      success: true,
      discounts: [
        { duration: 1, discountPercentage: discounts[1], label: '1 Month' },
        { duration: 3, discountPercentage: discounts[3], label: '3 Months' },
        { duration: 6, discountPercentage: discounts[6], label: '6 Months' },
        { duration: 12, discountPercentage: discounts[12], label: '12 Months' }
      ]
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Get pricing configuration
 * GET /api/calculate/pricing-config
 */
const getPricing = async (req, res, next) => {
  try {
    const pricing = getPricingConfig();

    res.status(200).json({
      success: true,
      pricing: {
        singleBed: pricing.singleBed,
        doubleBed: pricing.doubleBed,
        curtainSet: pricing.curtainSet
      }
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  calculateDeposit,
  calculateSubscriptionPricing,
  getDiscounts,
  getPricing
};
