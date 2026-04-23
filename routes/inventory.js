const express = require('express');
const router = express.Router();
const Inventory = require('../models/Inventory');
const Category = require('../models/Category');
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/rbac');

// Get user's inventory (Individual users)
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const inventory = await Inventory.find({ 'assignedTo.userId': req.user._id })
      .populate('categoryId')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: inventory.length, inventory });
  } catch (error) {
    // If no inventory found, return empty array
    res.json({ success: true, count: 0, inventory: [] });
  }
});

// Get all inventory (Admin)
router.get('/', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const inventory = await Inventory.find().populate('categoryId');
    res.json({ success: true, inventory });
  } catch (error) {
    next(error);
  }
});

// Create inventory item (Admin)
router.post('/', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const item = await Inventory.create(req.body);
    res.status(201).json({ success: true, item });
  } catch (error) {
    next(error);
  }
});

// Get categories
router.get('/categories', async (req, res, next) => {
  try {
    const categories = await Category.find();
    res.json({ success: true, categories });
  } catch (error) {
    next(error);
  }
});

// Create category (Admin)
router.post('/categories', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({ success: true, category });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
