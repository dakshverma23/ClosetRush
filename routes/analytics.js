const express = require('express');
const router = express.Router();
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');
const { requireAdmin, requireBusinessOrAdmin } = require('../middleware/rbac');

// Get overview analytics
router.get('/overview', authenticate, requireBusinessOrAdmin, async (req, res, next) => {
  try {
    const { propertyId } = req.query;
    
    const query = {};
    if (req.user.userType === 'business' && propertyId) {
      query.propertyId = propertyId;
    } else if (req.user.userType === 'business') {
      query.userId = req.user._id;
    }
    
    const totalSubscriptions = await Subscription.countDocuments(query);
    const activeSubscriptions = await Subscription.countDocuments({ ...query, status: 'active' });
    
    // Calculate revenue
    const subscriptions = await Subscription.find({ ...query, status: 'active' });
    const monthlyRevenue = subscriptions.reduce((sum, sub) => sum + (sub.finalPrice / sub.duration), 0);
    
    res.json({
      success: true,
      analytics: {
        totalSubscriptions,
        activeSubscriptions,
        monthlyRevenue: Math.round(monthlyRevenue)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get user growth (Admin)
router.get('/users', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const individualUsers = await User.countDocuments({ userType: 'individual' });
    const businessUsers = await User.countDocuments({ userType: 'business' });
    
    res.json({
      success: true,
      userStats: {
        total: totalUsers,
        individual: individualUsers,
        business: businessUsers
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
