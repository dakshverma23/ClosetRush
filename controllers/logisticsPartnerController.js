const User = require('../models/User');
const ApiError = require('../utils/apiError');
const {
  notifyLogisticsPartnerApproved,
  notifyLogisticsPartnerRejected
} = require('../services/notificationService');

/**
 * List all logistics partners
 * GET /api/logistics-partners
 * Supports optional ?status= filter (pending | approved | rejected)
 */
const listLogisticsPartners = async (req, res, next) => {
  try {
    const filter = { userType: 'logistics_partner' };
    if (req.query.status) {
      filter.logisticsPartnerStatus = req.query.status;
    }

    const partners = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: partners.length,
      members: partners
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Approve a logistics partner registration
 * PATCH /api/logistics-partners/:id/approve
 */
const approveLogisticsPartner = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      throw ApiError.notFound('Logistics partner not found', 'USER_NOT_FOUND');
    }
    if (user.userType !== 'logistics_partner') {
      throw ApiError.badRequest('User is not a logistics partner');
    }

    user.logisticsPartnerStatus = 'approved';
    user.logisticsPartnerApprovedBy = req.user._id;
    user.logisticsPartnerApprovedAt = new Date();
    await user.save();

    await notifyLogisticsPartnerApproved(user._id);

    res.status(200).json({
      success: true,
      message: 'Logistics partner approved successfully',
      member: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reject a logistics partner registration
 * PATCH /api/logistics-partners/:id/reject
 */
const rejectLogisticsPartner = async (req, res, next) => {
  try {
    const { reason } = req.body;
    if (!reason || !reason.trim()) {
      throw ApiError.badRequest('Rejection reason is required');
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      throw ApiError.notFound('Logistics partner not found', 'USER_NOT_FOUND');
    }
    if (user.userType !== 'logistics_partner') {
      throw ApiError.badRequest('User is not a logistics partner');
    }

    user.logisticsPartnerStatus = 'rejected';
    user.logisticsPartnerRejectionReason = reason.trim();
    await user.save();

    await notifyLogisticsPartnerRejected(user._id, reason.trim());

    res.status(200).json({
      success: true,
      message: 'Logistics partner rejected',
      member: user
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listLogisticsPartners,
  approveLogisticsPartner,
  rejectLogisticsPartner
};
