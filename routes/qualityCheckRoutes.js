const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { requireAdmin, requireWarehouseManager } = require('../middleware/rbac');
const {
  submitQualityCheck,
  getQualityChecks,
  getQualityCheckById,
  reviewQualityCheck
} = require('../controllers/qualityCheckController');

// Cloudinary upload — multiple images
const { cloudinary } = require('../config/cloudinary');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'closet-rush/quality-checks',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, height: 1200, crop: 'limit' }]
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB per image
});

// POST /api/quality-checks — warehouse manager submits
router.post(
  '/',
  authenticate,
  requireWarehouseManager,
  upload.array('images', 10),
  submitQualityCheck
);

// GET /api/quality-checks — admin sees all, warehouse manager sees own
router.get(
  '/',
  authenticate,
  getQualityChecks
);

// GET /api/quality-checks/:id
router.get(
  '/:id',
  authenticate,
  getQualityCheckById
);

// PATCH /api/quality-checks/:id/review — admin only
router.patch(
  '/:id/review',
  authenticate,
  requireAdmin,
  reviewQualityCheck
);

module.exports = router;
