const express = require('express');
const router = express.Router();
const Deposit = require('../models/Deposit');
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/rbac');
const ApiError = require('../utils/apiError');

// Get user's deposit
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const deposit = await Deposit.findOne({ userId: req.user._id, propertyId: null });
    res.json({ success: true, deposit: deposit || { totalAmount: 0, remainingAmount: 0, deductions: [] } });
  } catch (error) {
    next(error);
  }
});

// Get all deposits (Admin)
router.get('/', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const deposits = await Deposit.find().populate('userId', 'name email').populate('propertyId', 'name');
    res.json({ success: true, deposits });
  } catch (error) {
    next(error);
  }
});

// Deduct from deposit (Admin)
router.post('/deduct', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { userId, propertyId, amount, reason } = req.body;
    
    const query = { userId };
    if (propertyId) query.propertyId = propertyId;
    
    let deposit = await Deposit.findOne(query);
    if (!deposit) {
      throw ApiError.notFound('Deposit not found');
    }
    
    await deposit.deduct(amount, reason, req.user._id);
    res.json({ success: true, message: 'Deduction applied', deposit });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
