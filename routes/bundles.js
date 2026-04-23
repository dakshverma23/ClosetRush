const express = require('express');
const router = express.Router();
const bundleController = require('../controllers/bundleController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/rbac');

/**
 * @route   GET /api/bundles
 * @desc    Get all bundles
 * @access  Public (shows only active) / Admin (shows all)
 */
router.get('/', optionalAuth, bundleController.getAllBundles);

/**
 * @route   GET /api/bundles/:id
 * @desc    Get bundle by ID
 * @access  Public
 */
router.get('/:id', bundleController.getBundleById);

/**
 * @route   POST /api/bundles
 * @desc    Create new bundle
 * @access  Admin only
 */
router.post('/', authenticate, requireAdmin, bundleController.createBundle);

/**
 * @route   PUT /api/bundles/:id
 * @desc    Update bundle
 * @access  Admin only
 */
router.put('/:id', authenticate, requireAdmin, bundleController.updateBundle);

/**
 * @route   PATCH /api/bundles/:id/status
 * @desc    Toggle bundle active status
 * @access  Admin only
 */
router.patch('/:id/status', authenticate, requireAdmin, bundleController.toggleBundleStatus);

/**
 * @route   DELETE /api/bundles/:id
 * @desc    Delete bundle
 * @access  Admin only
 */
router.delete('/:id', authenticate, requireAdmin, bundleController.deleteBundle);

module.exports = router;
