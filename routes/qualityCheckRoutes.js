const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { requireAdmin, requireWarehouseManager } = require('../middleware/rbac');
const { upload } = require('../config/cloudinary');
const {
  submitQualityCheck,
  getQualityChecks,
  getQualityCheckById,
  reviewQualityCheck
} = require('../controllers/qualityCheckController');

// POST /api/quality-checks — submit quality check (warehouse manager only)
router.post('/', authenticate, requireWarehouseManager, upload.array('images', 20), submitQualityCheck);

// GET /api/quality-checks — get all quality checks (admin sees all, warehouse manager sees own)
router.get('/', authenticate, getQualityChecks);

// GET /api/quality-checks/:id — get single quality check
router.get('/:id', authenticate, getQualityCheckById);

// PATCH /api/quality-checks/:id/review — admin reviews quality check
router.patch('/:id/review', authenticate, requireAdmin, reviewQualityCheck);

module.exports = router;
