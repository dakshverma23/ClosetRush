const express = require('express');
const router = express.Router();
const {
  submitQuote,
  getAllQuotes,
  getQuote,
  updateQuoteStatus,
  addQuoteNote,
  updateQuote,
  deleteQuote,
  getUserQuotes,
  getPendingQuotes
} = require('../controllers/quoteController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

// Public/User routes
router.post('/', authenticate, submitQuote);
router.get('/my-quotes', authenticate, getUserQuotes);

// Admin routes
router.get('/', authenticate, requireRole('admin'), getAllQuotes);
router.get('/pending', authenticate, requireRole('admin'), getPendingQuotes);
router.get('/:id', authenticate, requireRole('admin'), getQuote);
router.patch('/:id/status', authenticate, requireRole('admin'), updateQuoteStatus);
router.post('/:id/notes', authenticate, requireRole('admin'), addQuoteNote);
router.put('/:id', authenticate, requireRole('admin'), updateQuote);
router.delete('/:id', authenticate, requireRole('admin'), deleteQuote);

module.exports = router;
