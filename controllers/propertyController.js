const Property = require('../models/Property');
const Subscription = require('../models/Subscription');
const ApiError = require('../utils/apiError');

/**
 * Get user's properties
 * GET /api/properties
 */
const getProperties = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { active } = req.query;

    // Build query
    const query = { userId };
    
    if (active !== undefined) {
      query.active = active === 'true';
    }

    const properties = await Property.find(query)
      .populate('subscriptionCount')
      .populate('activeSubscriptionCount')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: properties.length,
      properties
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Get property by ID
 * GET /api/properties/:id
 */
const getPropertyById = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('subscriptionCount')
      .populate('activeSubscriptionCount');

    if (!property) {
      throw ApiError.notFound('Property not found', 'PROPERTY_NOT_FOUND');
    }

    // Check ownership (unless admin)
    if (req.user.userType !== 'admin' && property.userId.toString() !== req.user._id.toString()) {
      throw ApiError.forbidden('Access denied to this property');
    }

    res.status(200).json({
      success: true,
      property
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Create new property
 * POST /api/properties
 */
const createProperty = async (req, res, next) => {
  try {
    const { name, address, propertyType, contactPerson, totalUnits, notes } = req.body;
    const userId = req.user._id;

    // Validate required fields
    if (!name || !address) {
      throw ApiError.badRequest('Property name and address are required');
    }

    // Only business users and admins can create properties
    if (req.user.userType === 'individual') {
      throw ApiError.forbidden('Only business users can create properties');
    }

    const property = await Property.create({
      userId,
      name,
      address,
      propertyType: propertyType || 'other',
      contactPerson,
      totalUnits: totalUnits || 1,
      notes
    });

    res.status(201).json({
      success: true,
      message: 'Property created successfully',
      property
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Update property
 * PUT /api/properties/:id
 */
const updateProperty = async (req, res, next) => {
  try {
    const { name, address, propertyType, contactPerson, totalUnits, notes, active } = req.body;

    const property = await Property.findById(req.params.id);

    if (!property) {
      throw ApiError.notFound('Property not found', 'PROPERTY_NOT_FOUND');
    }

    // Check ownership (unless admin)
    if (req.user.userType !== 'admin' && property.userId.toString() !== req.user._id.toString()) {
      throw ApiError.forbidden('Access denied to this property');
    }

    // Update fields
    if (name) property.name = name;
    if (address) property.address = address;
    if (propertyType) property.propertyType = propertyType;
    if (contactPerson) property.contactPerson = contactPerson;
    if (totalUnits !== undefined) property.totalUnits = totalUnits;
    if (notes !== undefined) property.notes = notes;
    if (active !== undefined) property.active = active;

    await property.save();

    res.status(200).json({
      success: true,
      message: 'Property updated successfully',
      property
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Delete property
 * DELETE /api/properties/:id
 */
const deleteProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      throw ApiError.notFound('Property not found', 'PROPERTY_NOT_FOUND');
    }

    // Check ownership (unless admin)
    if (req.user.userType !== 'admin' && property.userId.toString() !== req.user._id.toString()) {
      throw ApiError.forbidden('Access denied to this property');
    }

    // Check if property has active subscriptions
    const hasActiveSubscriptions = await property.hasActiveSubscriptions();

    if (hasActiveSubscriptions) {
      throw ApiError.conflict(
        'Cannot delete property with active subscriptions',
        'PROPERTY_HAS_SUBSCRIPTIONS'
      );
    }

    await property.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Property deleted successfully'
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Get property subscriptions
 * GET /api/properties/:id/subscriptions
 */
const getPropertySubscriptions = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      throw ApiError.notFound('Property not found', 'PROPERTY_NOT_FOUND');
    }

    // Check ownership (unless admin)
    if (req.user.userType !== 'admin' && property.userId.toString() !== req.user._id.toString()) {
      throw ApiError.forbidden('Access denied to this property');
    }

    const subscriptions = await Subscription.find({ propertyId: req.params.id })
      .populate('bundleId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: subscriptions.length,
      property: {
        id: property._id,
        name: property.name,
        address: property.address
      },
      subscriptions
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Get property inventory
 * GET /api/properties/:id/inventory
 */
const getPropertyInventory = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      throw ApiError.notFound('Property not found', 'PROPERTY_NOT_FOUND');
    }

    // Check ownership (unless admin)
    if (req.user.userType !== 'admin' && property.userId.toString() !== req.user._id.toString()) {
      throw ApiError.forbidden('Access denied to this property');
    }

    // Get inventory items assigned to this property
    const Inventory = require('../models/Inventory');
    const inventory = await Inventory.find({ 'assignedTo.propertyId': req.params.id })
      .populate('categoryId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: inventory.length,
      property: {
        id: property._id,
        name: property.name,
        address: property.address
      },
      inventory
    });

  } catch (error) {
    // If Inventory model doesn't exist yet, return empty array
    if (error.message.includes('Cannot find module')) {
      return res.status(200).json({
        success: true,
        count: 0,
        property: {
          id: req.params.id
        },
        inventory: [],
        message: 'Inventory system not yet implemented'
      });
    }
    next(error);
  }
};

/**
 * Get property deposit
 * GET /api/properties/:id/deposit
 */
const getPropertyDeposit = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      throw ApiError.notFound('Property not found', 'PROPERTY_NOT_FOUND');
    }

    // Check ownership (unless admin)
    if (req.user.userType !== 'admin' && property.userId.toString() !== req.user._id.toString()) {
      throw ApiError.forbidden('Access denied to this property');
    }

    // Get deposit information for this property
    const Deposit = require('../models/Deposit');
    const deposit = await Deposit.findOne({ propertyId: req.params.id });

    res.status(200).json({
      success: true,
      property: {
        id: property._id,
        name: property.name,
        address: property.address
      },
      deposit: deposit || {
        totalAmount: 0,
        remainingAmount: 0,
        deductions: []
      }
    });

  } catch (error) {
    // If Deposit model doesn't exist yet, return default
    if (error.message.includes('Cannot find module')) {
      return res.status(200).json({
        success: true,
        property: {
          id: req.params.id
        },
        deposit: {
          totalAmount: 0,
          remainingAmount: 0,
          deductions: []
        },
        message: 'Deposit system not yet implemented'
      });
    }
    next(error);
  }
};

module.exports = {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  getPropertySubscriptions,
  getPropertyInventory,
  getPropertyDeposit
};
