const express = require('express');
const router = express.Router();
const multer = require('multer');
const scienceSectionController = require('../controllers/scienceSectionController');
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/rbac');

// Configure multer for file uploads
const upload = multer({ 
  dest: 'uploads/',
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Public routes
router.get('/', scienceSectionController.getAllSections);
router.get('/:id', scienceSectionController.getSectionById);

// Admin routes
router.post('/', 
  authenticate, 
  requireAdmin, 
  scienceSectionController.createSection
);

router.put('/:id', 
  authenticate, 
  requireAdmin, 
  scienceSectionController.updateSection
);

router.post('/:id/images', 
  authenticate, 
  requireAdmin, 
  upload.single('image'),
  scienceSectionController.uploadImage
);

router.delete('/:id/images/:imageId', 
  authenticate, 
  requireAdmin, 
  scienceSectionController.deleteImage
);

router.delete('/:id', 
  authenticate, 
  requireAdmin, 
  scienceSectionController.deleteSection
);

module.exports = router;
