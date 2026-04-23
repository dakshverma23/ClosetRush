const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const User = require('../models/User');
const ApiError = require('../utils/apiError');

/**
 * @route   GET /api/users
 * @desc    Get all users (Admin only)
 * @access  Private/Admin
 */
router.get('/', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const { userType, active, search, page = 1, limit = 10 } = req.query;

    // Build filter
    const filter = {};
    
    if (userType) {
      filter.userType = userType;
    }
    
    if (active !== undefined) {
      filter.active = active === 'true';
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (page - 1) * limit;
    
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    res.status(200).json({
      users,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/users/:id
 * @desc    Get single user by ID (Admin only)
 * @access  Private/Admin
 */
router.get('/:id', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PATCH /api/users/:id/toggle-status
 * @desc    Activate/Deactivate user (Admin only)
 * @access  Private/Admin
 */
router.patch('/:id/toggle-status', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    // Don't allow deactivating yourself
    if (user._id.toString() === req.user.userId) {
      throw ApiError.badRequest('Cannot deactivate your own account');
    }

    user.active = !user.active;
    await user.save();

    res.status(200).json({
      message: `User ${user.active ? 'activated' : 'deactivated'} successfully`,
      user: user.toJSON()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/users/:id
 * @desc    Update user details (Admin only)
 * @access  Private/Admin
 */
router.put('/:id', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const { name, email, mobile, address, userType } = req.body;
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw ApiError.conflict('Email already in use');
      }
      user.email = email;
    }

    // Check if mobile is being changed and if it's already taken
    if (mobile && mobile !== user.mobile) {
      const existingUser = await User.findOne({ mobile });
      if (existingUser) {
        throw ApiError.conflict('Mobile number already in use');
      }
      user.mobile = mobile;
    }

    // Update other fields
    if (name) user.name = name;
    if (address) user.address = address;
    if (userType) user.userType = userType;

    await user.save();

    res.status(200).json({
      message: 'User updated successfully',
      user: user.toJSON()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user (Admin only)
 * @access  Private/Admin
 */
router.delete('/:id', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    // Don't allow deleting yourself
    if (user._id.toString() === req.user.userId) {
      throw ApiError.badRequest('Cannot delete your own account');
    }

    await user.deleteOne();

    res.status(200).json({
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/users/stats/summary
 * @desc    Get user statistics (Admin only)
 * @access  Private/Admin
 */
router.get('/stats/summary', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ active: true });
    const individualUsers = await User.countDocuments({ userType: 'individual' });
    const businessUsers = await User.countDocuments({ userType: 'business' });
    const adminUsers = await User.countDocuments({ userType: 'admin' });

    res.status(200).json({
      stats: {
        total: totalUsers,
        active: activeUsers,
        inactive: totalUsers - activeUsers,
        individual: individualUsers,
        business: businessUsers,
        admin: adminUsers
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
