/**
 * Calculator Service
 * Handles deposit and pricing calculations
 */

// Price configuration (centralized)
const PRICING = {
  singleBed: 500,
  doubleBed: 1000,
  curtainSet: 200
};

// Discount tiers based on subscription duration
const DISCOUNT_TIERS = {
  1: 0,    // 1 month - 0% discount
  3: 5,    // 3 months - 5% discount
  6: 10,   // 6 months - 10% discount
  12: 20   // 12 months - 20% discount
};

/**
 * Calculate security deposit
 * Formula: (singleBeds × 500) + (doubleBeds × 1000) + (curtainSets × 200)
 * 
 * @param {object} order - Order details
 * @param {number} order.singleBeds - Number of single beds
 * @param {number} order.doubleBeds - Number of double beds
 * @param {number} order.curtainSets - Number of curtain sets
 * @returns {number} Total security deposit amount
 * @throws {Error} If quantities are negative
 */
const calculateFixedDeposit = (order) => {
  const { singleBeds = 0, doubleBeds = 0, curtainSets = 0 } = order;

  // Validate quantities
  if (singleBeds < 0 || doubleBeds < 0 || curtainSets < 0) {
    throw new Error('Quantities cannot be negative');
  }

  // Calculate total deposit
  const total = 
    (singleBeds * PRICING.singleBed) +
    (doubleBeds * PRICING.doubleBed) +
    (curtainSets * PRICING.curtainSet);

  return total;
};

/**
 * Calculate subscription pricing with discount
 * 
 * @param {number} basePrice - Base monthly price
 * @param {number} duration - Subscription duration in months (1, 3, 6, or 12)
 * @returns {object} Pricing breakdown
 */
const calculatePricing = (basePrice, duration) => {
  // Validate duration
  if (![1, 3, 6, 12].includes(duration)) {
    throw new Error('Invalid subscription duration. Allowed values: 1, 3, 6, 12 months');
  }

  // Get discount percentage
  const discountPercentage = DISCOUNT_TIERS[duration];

  // Calculate total price for duration
  const originalPrice = basePrice * duration;

  // Calculate discount amount
  const discountAmount = (originalPrice * discountPercentage) / 100;

  // Calculate final price
  const finalPrice = originalPrice - discountAmount;

  return {
    basePrice,
    duration,
    originalPrice,
    discountPercentage,
    discountAmount,
    finalPrice,
    monthlyEquivalent: finalPrice / duration
  };
};

/**
 * Calculate bundle pricing with discount
 * 
 * @param {object} bundle - Bundle details
 * @param {number} bundle.price - Bundle monthly price
 * @param {number} duration - Subscription duration in months
 * @returns {object} Pricing breakdown
 */
const calculateBundlePricing = (bundle, duration) => {
  return calculatePricing(bundle.price, duration);
};

/**
 * Get discount percentage for duration
 * 
 * @param {number} duration - Subscription duration in months
 * @returns {number} Discount percentage
 */
const getDiscountPercentage = (duration) => {
  return DISCOUNT_TIERS[duration] || 0;
};

/**
 * Get pricing configuration
 * 
 * @returns {object} Pricing configuration
 */
const getPricingConfig = () => {
  return { ...PRICING };
};

/**
 * Get discount tiers
 * 
 * @returns {object} Discount tiers
 */
const getDiscountTiers = () => {
  return { ...DISCOUNT_TIERS };
};

module.exports = {
  calculateFixedDeposit,
  calculatePricing,
  calculateBundlePricing,
  getDiscountPercentage,
  getPricingConfig,
  getDiscountTiers
};
