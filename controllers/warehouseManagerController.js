const User = require('../models/User');
const ApiError = require('../utils/apiError');
const {
  notifyWarehouseManagerApproved,
  notifyWarehouseManagerRejected
} = require('../services/notificationService');

/**
 * List all warehouse managers
 * GET /api/warehouse-managers
 * Supports optional ?status= filter (pending | approved | rejected)
 */
const listWarehouseManagers = async (req, res, next) => {
  try {
    const filter = { userType: 'warehouse_manager' };
    if (req.query.status) {
      filter.warehouseManagerStatus = req.query.status;
    }

    const members = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: members.length,
      members
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Approve a warehouse manager registration
 * PATCH /api/warehouse-managers/:id/approve
 */
const approveWarehouseManager = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      throw ApiError.notFound('Warehouse manager not found', 'USER_NOT_FOUND');
    }
    if (user.userType !== 'warehouse_manager') {
      throw ApiError.badRequest('User is not a warehouse manager');
    }

    user.warehouseManagerStatus = 'approved';
    user.warehouseManagerApprovedBy = req.user._id;
    user.warehouseManagerApprovedAt = new Date();
    await user.save();

    await notifyWarehouseManagerApproved(user._id);

    res.status(200).json({
      success: true,
      message: 'Warehouse manager approved successfully',
      member: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reject a warehouse manager registration
 * PATCH /api/warehouse-managers/:id/reject
 */
const rejectWarehouseManager = async (req, res, next) => {
  try {
    const { reason } = req.body;
    if (!reason || !reason.trim()) {
      throw ApiError.badRequest('Rejection reason is required');
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      throw ApiError.notFound('Warehouse manager not found', 'USER_NOT_FOUND');
    }
    if (user.userType !== 'warehouse_manager') {
      throw ApiError.badRequest('User is not a warehouse manager');
    }

    user.warehouseManagerStatus = 'rejected';
    user.warehouseManagerRejectionReason = reason.trim();
    await user.save();

    await notifyWarehouseManagerRejected(user._id, reason.trim());

    res.status(200).json({
      success: true,
      message: 'Warehouse manager rejected',
      member: user
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listWarehouseManagers,
  approveWarehouseManager,
  rejectWarehouseManager
};
