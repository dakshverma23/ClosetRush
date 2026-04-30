const express = require('express');
const router = express.Router();
const calculateController = require('../controllers/calculateController');

/**
 * @route   POST /api/calculate/deposit
 * @desc    Calculate security deposit
 * @access  Public
 */
router.post('/deposit', calculateController.calculateDeposit);

/**
 * @route   POST /api/calculate/pricing
 * @desc    Calculate subscription pricing with discount
 * @access  Public
 */
router.post('/pricing', calculateController.calculateSubscriptionPricing);

/**
 * @route   GET /api/calculate/discounts
 * @desc    Get discount tiers
 * @access  Public
 */
router.get('/discounts', calculateController.getDiscounts);

/**
 * @route   GET /api/calculate/pricing-config
 * @desc    Get pricing configuration
 * @access  Public
 */
router.get('/pricing-config', calculateController.getPricing);

module.exports = router;
