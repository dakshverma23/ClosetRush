const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/rbac');
const ApiError = require('../utils/apiError');

/**
 * @route   GET /api/pickup-members/pending
 * @desc    Get all pending pickup member requests
 * @access  Admin only
 */
router.get('/pending', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const pendingMembers = await User.find({
      userType: 'pickup_member',
      pickupMemberStatus: 'pending'
    }).select('-password').sort({ createdAt: -1 });

    res.json({
      success: true,
      count: pendingMembers.length,
      members: pendingMembers
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/pickup-members
 * @desc    Get all pickup members (approved, pending, rejected)
 * @access  Admin only
 */
router.get('/', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = { userType: 'pickup_member' };
    
    if (status) {
      filter.pickupMemberStatus = status;
    }

    const members = await User.find(filter)
      .select('-password')
      .populate('pickupMemberApprovedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: members.length,
      members
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PATCH /api/pickup-members/:id/approve
 * @desc    Approve pickup member
 * @access  Admin only
 */
router.patch('/:id/approve', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const member = await User.findById(req.params.id);

    if (!member) {
      throw ApiError.notFound('Pickup member not found');
    }

    if (member.userType !== 'pickup_member') {
      throw ApiError.badRequest('User is not a pickup member');
    }

    member.pickupMemberStatus = 'approved';
    member.pickupMemberApprovedBy = req.user._id;
    member.pickupMemberApprovedAt = new Date();
    member.pickupMemberRejectionReason = undefined;

    await member.save();

    res.json({
      success: true,
      message: 'Pickup member approved successfully',
      member
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PATCH /api/pickup-members/:id/reject
 * @desc    Reject pickup member
 * @access  Admin only
 */
router.patch('/:id/reject', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { reason } = req.body;

    const member = await User.findById(req.params.id);

    if (!member) {
      throw ApiError.notFound('Pickup member not found');
    }

    if (member.userType !== 'pickup_member') {
      throw ApiError.badRequest('User is not a pickup member');
    }

    member.pickupMemberStatus = 'rejected';
    member.pickupMemberRejectionReason = reason || 'No reason provided';
    member.pickupMemberApprovedBy = req.user._id;
    member.pickupMemberApprovedAt = new Date();

    await member.save();

    res.json({
      success: true,
      message: 'Pickup member rejected',
      member
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/pickup-members/my-status
 * @desc    Get current user's pickup member status
 * @access  Authenticated pickup members
 */
router.get('/my-status', authenticate, async (req, res, next) => {
  try {
    if (req.user.userType !== 'pickup_member') {
      throw ApiError.forbidden('Not a pickup member');
    }

    res.json({
      success: true,
      status: req.user.pickupMemberStatus,
      approvedAt: req.user.pickupMemberApprovedAt,
      rejectionReason: req.user.pickupMemberRejectionReason
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
