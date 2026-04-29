const ApiError = require('../utils/apiError');

/**
 * Role-Based Access Control Middleware
 * Checks if user has required role(s) to access a route
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        throw ApiError.unauthorized('Authentication required');
      }

      // Check if user has one of the allowed roles
      if (!allowedRoles.includes(req.user.userType)) {
        throw ApiError.forbidden(
          'You do not have permission to perform this action',
          'INSUFFICIENT_PERMISSIONS'
        );
      }

      next();

    } catch (error) {
      next(error);
    }
  };
};

/**
 * Admin-only middleware
 */
const requireAdmin = requireRole('admin');

/**
 * Business user or admin middleware
 */
const requireBusinessOrAdmin = requireRole('business', 'admin');

/**
 * Any authenticated user middleware
 */
const requireAuth = requireRole('individual', 'business', 'admin', 'warehouse_manager', 'logistics_partner');

/**
 * Check if user owns the resource
 * Used for routes like /users/:id where users can only access their own data
 */
const requireOwnership = (req, res, next) => {
  try {
    const resourceUserId = req.params.id || req.params.userId;
    const currentUserId = req.user._id.toString();

    // Admins can access any resource
    if (req.user.userType === 'admin') {
      return next();
    }

    // Check if user owns the resource
    if (resourceUserId !== currentUserId) {
      throw ApiError.forbidden(
        'Access denied to this resource',
        'RESOURCE_ACCESS_DENIED'
      );
    }

    next();

  } catch (error) {
    next(error);
  }
};

/**
 * Check if business user owns the property
 */
const requirePropertyOwnership = async (req, res, next) => {
  try {
    const propertyId = req.params.id || req.params.propertyId;
    const currentUserId = req.user._id.toString();

    // Admins can access any property
    if (req.user.userType === 'admin') {
      return next();
    }

    // Check if user is a business user
    if (req.user.userType !== 'business') {
      throw ApiError.forbidden('Only business users can manage properties');
    }

    // Property ownership check will be done in the controller
    // This middleware just ensures the user is a business user or admin
    next();

  } catch (error) {
    next(error);
  }
};

/**
 * Warehouse Manager middleware (approved only) — formerly requirePickupMember
 */
const requireWarehouseManager = (req, res, next) => {
  try {
    if (!req.user) {
      throw ApiError.unauthorized('Authentication required');
    }

    if (req.user.userType !== 'warehouse_manager') {
      throw ApiError.forbidden('Warehouse manager access required');
    }

    if (req.user.warehouseManagerStatus === 'rejected') {
      throw ApiError.forbidden(
        'Your warehouse manager account has been rejected',
        'ACCOUNT_REJECTED'
      );
    }

    if (req.user.warehouseManagerStatus !== 'approved') {
      throw ApiError.forbidden(
        'Your warehouse manager account is pending admin approval',
        'PENDING_APPROVAL'
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Logistics Partner middleware (approved only)
 */
const requireLogisticsPartner = (req, res, next) => {
  try {
    if (!req.user) {
      throw ApiError.unauthorized('Authentication required');
    }

    if (req.user.userType !== 'logistics_partner') {
      throw ApiError.forbidden('Logistics partner access required');
    }

    if (req.user.logisticsPartnerStatus === 'rejected') {
      throw ApiError.forbidden(
        'Your logistics partner account has been rejected',
        'ACCOUNT_REJECTED'
      );
    }

    if (req.user.logisticsPartnerStatus !== 'approved') {
      throw ApiError.forbidden(
        'Your logistics partner account is pending admin approval',
        'PENDING_APPROVAL'
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  requireRole,
  requireAdmin,
  requireBusinessOrAdmin,
  requireAuth,
  requireOwnership,
  requirePropertyOwnership,
  requireWarehouseManager,
  requireLogisticsPartner
};
