const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { authenticate } = require('../middleware/auth');
const ApiError = require('../utils/apiError');

/**
 * @route   GET /api/notifications
 * @desc    Get notifications for the authenticated user (latest 50, sorted by createdAt desc)
 * @access  Authenticated
 */
router.get('/', authenticate, async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [notifications, unreadCount] = await Promise.all([
      Notification.find({ userId })
        .sort({ createdAt: -1 })
        .limit(50),
      Notification.countDocuments({ userId, read: false })
    ]);

    res.json({
      success: true,
      notifications,
      unreadCount
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PATCH /api/notifications/read-all
 * @desc    Mark all unread notifications as read for the authenticated user
 * @access  Authenticated
 *
 * NOTE: This route MUST be defined before PATCH /:id/read to prevent Express
 * from matching "read-all" as an :id parameter.
 */
router.patch('/read-all', authenticate, async (req, res, next) => {
  try {
    const userId = req.user._id;

    const result = await Notification.updateMany(
      { userId, read: false },
      { $set: { read: true } }
    );

    res.json({
      success: true,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PATCH /api/notifications/:id/read
 * @desc    Mark a single notification as read
 * @access  Authenticated (owner only)
 */
router.patch('/:id/read', authenticate, async (req, res, next) => {
  try {
    const userId = req.user._id;

    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId },
      { $set: { read: true } },
      { new: true }
    );

    if (!notification) {
      throw ApiError.notFound('Notification not found');
    }

    res.json({
      success: true,
      notification
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
