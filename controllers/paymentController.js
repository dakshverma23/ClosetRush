const Razorpay = require('razorpay');
const crypto = require('crypto');
const SubscriptionRequest = require('../models/SubscriptionRequest');
const ApiError = require('../utils/apiError');

// Validate Razorpay credentials
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error('CRITICAL: Razorpay credentials are missing in environment variables');
  console.error('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID ? 'Present' : 'Missing');
  console.error('RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? 'Present' : 'Missing');
}

// Initialize Razorpay instance
let razorpay;
try {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
  console.log('✓ Razorpay initialized successfully');
} catch (error) {
  console.error('✗ Failed to initialize Razorpay:', error.message);
}

/**
 * Create Razorpay Order
 * POST /api/payments/create-order
 */
const createOrder = async (req, res, next) => {
  try {
    console.log('=== Create Order Request ===');
    console.log('User:', req.user ? req.user._id : 'No user');
    console.log('Body:', req.body);
    
    const { amount, currency = 'INR', receipt, subscriptionRequestId } = req.body;

    if (!amount) {
      throw ApiError.badRequest('Amount is required');
    }

    // Validate Razorpay instance
    if (!razorpay) {
      console.error('Razorpay instance not initialized');
      throw ApiError.internal('Payment gateway not configured properly');
    }

    // Validate credentials
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error('Razorpay credentials missing');
      throw ApiError.internal('Payment gateway credentials not configured');
    }

    // Create Razorpay order
    const options = {
      amount: Math.round(amount * 100), // Amount in paise (multiply by 100)
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      notes: {
        subscriptionRequestId: subscriptionRequestId || '',
        userId: req.user ? req.user._id.toString() : 'guest'
      }
    };

    console.log('Creating Razorpay order with options:', options);

    const order = await razorpay.orders.create(options);

    console.log('Order created successfully:', order.id);

    res.status(200).json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt
      },
      key: process.env.RAZORPAY_KEY_ID
    });

  } catch (error) {
    console.error('=== Razorpay Order Creation Error ===');
    console.error('Error message:', error.message);
    console.error('Error details:', error);
    console.error('Stack:', error.stack);
    
    // Check if it's a Razorpay API error
    if (error.error) {
      console.error('Razorpay API Error:', error.error);
      next(ApiError.internal(`Payment gateway error: ${error.error.description || error.message}`));
    } else {
      next(ApiError.internal(`Failed to create payment order: ${error.message}`));
    }
  }
};

/**
 * Verify Razorpay Payment Signature
 * POST /api/payments/verify
 */
const verifyPayment = async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      subscriptionRequestId
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw ApiError.badRequest('Missing payment verification parameters');
    }

    // Generate signature for verification
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    // Verify signature
    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      throw ApiError.badRequest('Invalid payment signature');
    }

    // Update subscription request with payment details
    if (subscriptionRequestId) {
      const subscriptionRequest = await SubscriptionRequest.findById(subscriptionRequestId);
      
      if (subscriptionRequest) {
        subscriptionRequest.paymentMethod = 'razorpay';
        subscriptionRequest.paymentStatus = 'completed';
        subscriptionRequest.razorpayOrderId = razorpay_order_id;
        subscriptionRequest.razorpayPaymentId = razorpay_payment_id;
        await subscriptionRequest.save();
      }
    }

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    next(error);
  }
};

/**
 * Get Payment Details
 * GET /api/payments/:paymentId
 */
const getPaymentDetails = async (req, res, next) => {
  try {
    const { paymentId } = req.params;

    const payment = await razorpay.payments.fetch(paymentId);

    res.status(200).json({
      success: true,
      payment: {
        id: payment.id,
        amount: payment.amount / 100, // Convert paise to rupees
        currency: payment.currency,
        status: payment.status,
        method: payment.method,
        email: payment.email,
        contact: payment.contact,
        createdAt: new Date(payment.created_at * 1000)
      }
    });

  } catch (error) {
    console.error('Fetch payment error:', error);
    next(ApiError.internal('Failed to fetch payment details'));
  }
};

/**
 * Refund Payment
 * POST /api/payments/refund
 */
const refundPayment = async (req, res, next) => {
  try {
    const { paymentId, amount, reason } = req.body;

    if (!paymentId) {
      throw ApiError.badRequest('Payment ID is required');
    }

    // Admin only
    if (req.user.userType !== 'admin') {
      throw ApiError.forbidden('Only admins can process refunds');
    }

    const refundOptions = {
      payment_id: paymentId,
      notes: {
        reason: reason || 'Refund requested by admin',
        processedBy: req.user._id.toString()
      }
    };

    // If amount specified, do partial refund
    if (amount) {
      refundOptions.amount = Math.round(amount * 100); // Convert to paise
    }

    const refund = await razorpay.payments.refund(paymentId, refundOptions);

    res.status(200).json({
      success: true,
      message: 'Refund processed successfully',
      refund: {
        id: refund.id,
        amount: refund.amount / 100,
        status: refund.status,
        createdAt: new Date(refund.created_at * 1000)
      }
    });

  } catch (error) {
    console.error('Refund error:', error);
    next(ApiError.internal('Failed to process refund'));
  }
};

/**
 * Webhook Handler for Razorpay Events
 * POST /api/payments/webhook
 */
const handleWebhook = async (req, res, next) => {
  try {
    const webhookSignature = req.headers['x-razorpay-signature'];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (webhookSecret) {
      // Verify webhook signature
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(req.body))
        .digest('hex');

      if (webhookSignature !== expectedSignature) {
        throw ApiError.badRequest('Invalid webhook signature');
      }
    }

    const event = req.body.event;
    const payload = req.body.payload.payment.entity;

    console.log('Razorpay Webhook Event:', event);

    // Handle different webhook events
    switch (event) {
      case 'payment.captured':
        // Payment successful
        console.log('Payment captured:', payload.id);
        // Update your database here
        break;

      case 'payment.failed':
        // Payment failed
        console.log('Payment failed:', payload.id);
        // Update your database here
        break;

      case 'refund.created':
        // Refund initiated
        console.log('Refund created:', payload.id);
        break;

      default:
        console.log('Unhandled webhook event:', event);
    }

    res.status(200).json({ success: true });

  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ success: false, error: error.message });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  getPaymentDetails,
  refundPayment,
  handleWebhook
};
