const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');
const { authenticate } = require('../middleware/auth');
const { requireBusinessOrAdmin } = require('../middleware/rbac');

/**
 * @route   GET /api/properties
 * @desc    Get user's properties
 * @access  Private (Business users and Admin)
 */
router.get('/', authenticate, requireBusinessOrAdmin, propertyController.getProperties);

/**
 * @route   GET /api/properties/:id
 * @desc    Get property by ID
 * @access  Private (Owner or Admin)
 */
router.get('/:id', authenticate, requireBusinessOrAdmin, propertyController.getPropertyById);

/**
 * @route   POST /api/properties
 * @desc    Create new property
 * @access  Private (Business users and Admin)
 */
router.post('/', authenticate, requireBusinessOrAdmin, propertyController.createProperty);

/**
 * @route   PUT /api/properties/:id
 * @desc    Update property
 * @access  Private (Owner or Admin)
 */
router.put('/:id', authenticate, requireBusinessOrAdmin, propertyController.updateProperty);

/**
 * @route   DELETE /api/properties/:id
 * @desc    Delete property
 * @access  Private (Owner or Admin)
 */
router.delete('/:id', authenticate, requireBusinessOrAdmin, propertyController.deleteProperty);

/**
 * @route   GET /api/properties/:id/subscriptions
 * @desc    Get property subscriptions
 * @access  Private (Owner or Admin)
 */
router.get('/:id/subscriptions', authenticate, requireBusinessOrAdmin, propertyController.getPropertySubscriptions);

/**
 * @route   GET /api/properties/:id/inventory
 * @desc    Get property inventory
 * @access  Private (Owner or Admin)
 */
router.get('/:id/inventory', authenticate, requireBusinessOrAdmin, propertyController.getPropertyInventory);

/**
 * @route   GET /api/properties/:id/deposit
 * @desc    Get property deposit information
 * @access  Private (Owner or Admin)
 */
router.get('/:id/deposit', authenticate, requireBusinessOrAdmin, propertyController.getPropertyDeposit);

module.exports = router;
