const express = require('express');
const router = express.Router();
const SupportTicket = require('../models/SupportTicket');
const { protect, authorize } = require('../middleware/auth');
const ApiError = require('../utils/apiError');

// Get all tickets (Admin gets all, users get their own)
router.get('/', protect, async (req, res, next) => {
  try {
    let query = {};
    
    // If not admin, only show user's own tickets
    if (req.user.userType !== 'admin') {
      query.user = req.user._id;
    }
    
    const tickets = await SupportTicket.find(query)
      .populate('user', 'name email mobile userType')
      .sort({ createdAt: -1 });
    
    res.json({ 
      success: true, 
      count: tickets.length,
      tickets 
    });
  } catch (error) {
    next(error);
  }
});

// Get single ticket
router.get('/:id', protect, async (req, res, next) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id)
      .populate('user', 'name email mobile userType');
    
    if (!ticket) {
      throw ApiError.notFound('Ticket not found');
    }
    
    // Check if user has access to this ticket
    if (req.user.userType !== 'admin' && ticket.user._id.toString() !== req.user._id.toString()) {
      throw ApiError.forbidden('You do not have access to this ticket');
    }
    
    res.json({ 
      success: true, 
      ticket 
    });
  } catch (error) {
    next(error);
  }
});

// Create new ticket
router.post('/', protect, async (req, res, next) => {
  try {
    const { subject, description, category, priority } = req.body;
    
    if (!subject || !description) {
      throw ApiError.badRequest('Subject and description are required');
    }
    
    const ticket = await SupportTicket.create({
      user: req.user._id,
      subject,
      description,
      category: category || 'general',
      priority: priority || 'medium'
    });
    
    await ticket.populate('user', 'name email mobile userType');
    
    res.status(201).json({ 
      success: true, 
      message: 'Support ticket created successfully',
      ticket 
    });
  } catch (error) {
    next(error);
  }
});

// Update ticket status (Admin only)
router.patch('/:id/status', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      throw ApiError.badRequest('Status is required');
    }
    
    const ticket = await SupportTicket.findById(req.params.id);
    
    if (!ticket) {
      throw ApiError.notFound('Ticket not found');
    }
    
    ticket.status = status;
    await ticket.save();
    await ticket.populate('user', 'name email mobile userType');
    
    res.json({ 
      success: true, 
      message: 'Ticket status updated successfully',
      ticket 
    });
  } catch (error) {
    next(error);
  }
});

// Update ticket priority (Admin only)
router.patch('/:id/priority', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { priority } = req.body;
    
    if (!priority) {
      throw ApiError.badRequest('Priority is required');
    }
    
    const ticket = await SupportTicket.findById(req.params.id);
    
    if (!ticket) {
      throw ApiError.notFound('Ticket not found');
    }
    
    ticket.priority = priority;
    await ticket.save();
    await ticket.populate('user', 'name email mobile userType');
    
    res.json({ 
      success: true, 
      message: 'Ticket priority updated successfully',
      ticket 
    });
  } catch (error) {
    next(error);
  }
});

// Add reply to ticket
router.post('/:id/reply', protect, async (req, res, next) => {
  try {
    const { message } = req.body;
    
    if (!message || !message.trim()) {
      throw ApiError.badRequest('Reply message is required');
    }
    
    const ticket = await SupportTicket.findById(req.params.id);
    
    if (!ticket) {
      throw ApiError.notFound('Ticket not found');
    }
    
    // Check if user has access to this ticket
    if (req.user.userType !== 'admin' && ticket.user.toString() !== req.user._id.toString()) {
      throw ApiError.forbidden('You do not have access to this ticket');
    }
    
    ticket.replies.push({
      message: message.trim(),
      isAdmin: req.user.userType === 'admin',
      createdAt: new Date()
    });
    
    await ticket.save();
    await ticket.populate('user', 'name email mobile userType');
    
    res.json({ 
      success: true, 
      message: 'Reply added successfully',
      ticket 
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
