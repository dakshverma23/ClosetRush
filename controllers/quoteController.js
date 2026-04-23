const Quote = require('../models/Quote');
const ApiError = require('../utils/apiError');

/**
 * Submit a new quote request
 * POST /api/quotes
 */
const submitQuote = async (req, res, next) => {
  try {
    const {
      businessName,
      contactPerson,
      email,
      phone,
      businessType,
      type,
      // Connect type fields
      additionalRequirements,
      // Quotation type fields
      bundleSelections,
      numberOfProperties,
      estimatedCost,
      // Legacy fields
      properties,
      estimatedDeposit
    } = req.body;

    // Validate required fields (common to both types)
    if (!businessName || !contactPerson || !email || !phone) {
      throw ApiError.badRequest('Business name, contact person, email and phone are required');
    }

    const quoteType = type || 'quotation';

    // Create quote
    const quote = await Quote.create({
      userId: req.user._id,
      businessName,
      contactPerson,
      email,
      phone,
      businessType,
      type: quoteType,
      additionalRequirements,
      // Quotation-specific
      bundleSelections: bundleSelections || [],
      numberOfProperties: numberOfProperties || 1,
      unitsPerProperty: req.body.unitsPerProperty || 1,
      totalUnits: req.body.totalUnits || (numberOfProperties || 1),
      estimatedCost: estimatedCost || null,
      // Legacy
      properties: properties || [],
      estimatedDeposit: estimatedDeposit || 0,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: quoteType === 'connect'
        ? 'Message sent successfully'
        : 'Quote request submitted successfully',
      quote
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all quotes (Admin)
 * GET /api/quotes
 */
const getAllQuotes = async (req, res, next) => {
  try {
    const quotes = await Quote.find()
      .populate('userId', 'name email mobile')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: quotes.length,
      quotes
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's quotes
 * GET /api/quotes/my-quotes
 */
const getUserQuotes = async (req, res, next) => {
  try {
    const quotes = await Quote.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: quotes.length,
      quotes
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get pending quotes (Admin)
 * GET /api/quotes/pending
 */
const getPendingQuotes = async (req, res, next) => {
  try {
    const quotes = await Quote.find({ status: 'pending' })
      .populate('userId', 'name email mobile')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: quotes.length,
      quotes
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single quote (Admin)
 * GET /api/quotes/:id
 */
const getQuote = async (req, res, next) => {
  try {
    const quote = await Quote.findById(req.params.id)
      .populate('userId', 'name email mobile');

    if (!quote) {
      throw ApiError.notFound('Quote not found');
    }

    res.json({
      success: true,
      quote
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update quote status (Admin)
 * PATCH /api/quotes/:id/status
 */
const updateQuoteStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status) {
      throw ApiError.badRequest('Status is required');
    }

    const quote = await Quote.findById(req.params.id);

    if (!quote) {
      throw ApiError.notFound('Quote not found');
    }

    quote.status = status;
    await quote.save();

    res.json({
      success: true,
      message: 'Quote status updated',
      quote
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add note to quote (Admin)
 * POST /api/quotes/:id/notes
 */
const addQuoteNote = async (req, res, next) => {
  try {
    const { note } = req.body;

    if (!note) {
      throw ApiError.badRequest('Note is required');
    }

    const quote = await Quote.findById(req.params.id);

    if (!quote) {
      throw ApiError.notFound('Quote not found');
    }

    quote.adminNotes = quote.adminNotes || [];
    quote.adminNotes.push({
      note,
      addedBy: req.user._id,
      addedAt: new Date()
    });

    await quote.save();

    res.json({
      success: true,
      message: 'Note added',
      quote
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update quote (Admin)
 * PUT /api/quotes/:id
 */
const updateQuote = async (req, res, next) => {
  try {
    const quote = await Quote.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!quote) {
      throw ApiError.notFound('Quote not found');
    }

    res.json({
      success: true,
      message: 'Quote updated',
      quote
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete quote (Admin)
 * DELETE /api/quotes/:id
 */
const deleteQuote = async (req, res, next) => {
  try {
    const quote = await Quote.findByIdAndDelete(req.params.id);

    if (!quote) {
      throw ApiError.notFound('Quote not found');
    }

    res.json({
      success: true,
      message: 'Quote deleted'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitQuote,
  getAllQuotes,
  getUserQuotes,
  getPendingQuotes,
  getQuote,
  updateQuoteStatus,
  addQuoteNote,
  updateQuote,
  deleteQuote
};
