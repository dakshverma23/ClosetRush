# Razorpay Payment Gateway Integration

## Overview
This document describes the complete Razorpay payment gateway integration for ClosetRush subscription payments.

## Implementation Date
May 4, 2026

## Credentials Configuration

### Environment Variables

**Backend (.env)**:
```env
RAZORPAY_KEY_ID=rzp_live_SEHTPEZotHKWW1
RAZORPAY_KEY_SECRET=g4yPOt83ArcgZ9emSDTDYT8aRAZORPAY_KEY_SECRET
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
```

**Frontend (frontend/.env)**:
```env
REACT_APP_RAZORPAY_KEY_ID=rzp_live_SEHTPEZotHKWW1
```

## Files Created/Modified

### New Files
1. **controllers/paymentController.js** - Payment processing logic
2. **routes/payments.js** - Payment API routes
3. **docs/RAZORPAY_INTEGRATION.md** - This documentation

### Modified Files
1. **.env** - Added Razorpay credentials
2. **frontend/.env** - Added Razorpay Key ID
3. **models/SubscriptionRequest.js** - Added Razorpay payment fields
4. **server.js** - Added payment routes

## API Endpoints

### 1. Create Order
**POST** `/api/payments/create-order`

Creates a Razorpay order for payment processing.

**Request Body**:
```json
{
  "amount": 1500,
  "currency": "INR",
  "receipt": "receipt_001",
  "subscriptionRequestId": "64abc123..."
}
```

**Response**:
```json
{
  "success": true,
  "order": {
    "id": "order_xyz123",
    "amount": 150000,
    "currency": "INR",
    "receipt": "receipt_001"
  },
  "key": "rzp_live_SEHTPEZotHKWW1"
}
```

### 2. Verify Payment
**POST** `/api/payments/verify`

Verifies the payment signature after successful payment.

**Request Body**:
```json
{
  "razorpay_order_id": "order_xyz123",
  "razorpay_payment_id": "pay_abc456",
  "razorpay_signature": "signature_hash",
  "subscriptionRequestId": "64abc123..."
}
```

**Response**:
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "paymentId": "pay_abc456",
  "orderId": "order_xyz123"
}
```

### 3. Get Payment Details
**GET** `/api/payments/:paymentId`

Fetches details of a specific payment.

**Response**:
```json
{
  "success": true,
  "payment": {
    "id": "pay_abc456",
    "amount": 1500,
    "currency": "INR",
    "status": "captured",
    "method": "card",
    "email": "user@example.com",
    "contact": "+919876543210",
    "createdAt": "2026-05-04T10:30:00.000Z"
  }
}
```

### 4. Refund Payment (Admin Only)
**POST** `/api/payments/refund`

Processes a refund for a payment.

**Request Body**:
```json
{
  "paymentId": "pay_abc456",
  "amount": 1500,
  "reason": "Customer requested cancellation"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Refund processed successfully",
  "refund": {
    "id": "rfnd_xyz789",
    "amount": 1500,
    "status": "processed",
    "createdAt": "2026-05-04T11:00:00.000Z"
  }
}
```

### 5. Webhook Handler
**POST** `/api/payments/webhook`

Handles Razorpay webhook events (payment.captured, payment.failed, refund.created, etc.)

## Frontend Integration

### Step 1: Load Razorpay Script
Add Razorpay checkout script to your HTML:
```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

### Step 2: Create Order
```javascript
const createOrder = async (amount, subscriptionRequestId) => {
  try {
    const response = await api.post('/payments/create-order', {
      amount,
      currency: 'INR',
      subscriptionRequestId
    });
    return response.data;
  } catch (error) {
    console.error('Order creation failed:', error);
    throw error;
  }
};
```

### Step 3: Initialize Razorpay Checkout
```javascript
const handlePayment = async (orderData, subscriptionRequestId) => {
  const options = {
    key: process.env.REACT_APP_RAZORPAY_KEY_ID,
    amount: orderData.order.amount,
    currency: orderData.order.currency,
    name: 'ClosetRush',
    description: 'Subscription Payment',
    order_id: orderData.order.id,
    handler: async function (response) {
      // Payment successful
      await verifyPayment(response, subscriptionRequestId);
    },
    prefill: {
      name: user.name,
      email: user.email,
      contact: user.mobile
    },
    theme: {
      color: '#2563EB'
    },
    modal: {
      ondismiss: function() {
        console.log('Payment cancelled by user');
      }
    }
  };

  const razorpay = new window.Razorpay(options);
  razorpay.open();
};
```

### Step 4: Verify Payment
```javascript
const verifyPayment = async (response, subscriptionRequestId) => {
  try {
    const result = await api.post('/payments/verify', {
      razorpay_order_id: response.razorpay_order_id,
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_signature: response.razorpay_signature,
      subscriptionRequestId
    });
    
    if (result.data.success) {
      // Payment verified successfully
      message.success('Payment successful!');
      navigate('/dashboard');
    }
  } catch (error) {
    message.error('Payment verification failed');
  }
};
```

## Database Schema Updates

### SubscriptionRequest Model
Added the following fields:
```javascript
razorpayOrderId: {
  type: String,
  trim: true
},
razorpayPaymentId: {
  type: String,
  trim: true
},
razorpaySignature: {
  type: String,
  trim: true
}
```

## Payment Flow

### Standard Payment Flow
1. User selects subscription plan and fills delivery details
2. Frontend calls `/api/payments/create-order` with amount
3. Backend creates Razorpay order and returns order details
4. Frontend opens Razorpay checkout modal
5. User completes payment on Razorpay
6. Razorpay calls success handler with payment details
7. Frontend calls `/api/payments/verify` to verify signature
8. Backend verifies signature and updates SubscriptionRequest
9. Backend creates Subscription and Order records
10. User is redirected to dashboard

### Webhook Flow (Async)
1. Razorpay sends webhook event to `/api/payments/webhook`
2. Backend verifies webhook signature
3. Backend processes event (payment.captured, payment.failed, etc.)
4. Backend updates database accordingly
5. Backend sends response to Razorpay

## Security Features

### 1. Signature Verification
All payments are verified using HMAC SHA256 signature:
```javascript
const expectedSignature = crypto
  .createHmac('sha256', RAZORPAY_KEY_SECRET)
  .update(order_id + '|' + payment_id)
  .digest('hex');
```

### 2. Webhook Verification
Webhooks are verified using webhook secret:
```javascript
const expectedSignature = crypto
  .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
  .update(JSON.stringify(req.body))
  .digest('hex');
```

### 3. Amount Validation
- All amounts are converted to paise (multiply by 100)
- Amounts are validated before order creation
- Payment amounts are verified against order amounts

## Testing

### Test Mode
For testing, use Razorpay test credentials:
```env
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
RAZORPAY_KEY_SECRET=test_secret_key
```

### Test Cards
- **Success**: 4111 1111 1111 1111
- **Failure**: 4111 1111 1111 1112
- **CVV**: Any 3 digits
- **Expiry**: Any future date

### Test UPI
- **Success**: success@razorpay
- **Failure**: failure@razorpay

## Webhook Configuration

### Setup Webhooks in Razorpay Dashboard
1. Go to Razorpay Dashboard → Settings → Webhooks
2. Add webhook URL: `https://yourdomain.com/api/payments/webhook`
3. Select events to listen:
   - payment.captured
   - payment.failed
   - refund.created
   - refund.processed
4. Copy webhook secret and add to `.env` as `RAZORPAY_WEBHOOK_SECRET`

## Error Handling

### Common Errors
1. **Invalid signature**: Payment verification failed
2. **Order not found**: Invalid order ID
3. **Payment failed**: User's payment was declined
4. **Network error**: Connection to Razorpay failed

### Error Responses
```javascript
{
  "success": false,
  "error": {
    "code": "PAYMENT_VERIFICATION_FAILED",
    "message": "Invalid payment signature"
  }
}
```

## Refund Policy

### Full Refund
```javascript
await razorpay.payments.refund(paymentId);
```

### Partial Refund
```javascript
await razorpay.payments.refund(paymentId, {
  amount: 50000 // Amount in paise
});
```

## Production Checklist

- [x] Update `.env` with live Razorpay credentials
- [x] Update `frontend/.env` with live Razorpay Key ID
- [ ] Configure webhooks in Razorpay Dashboard
- [ ] Add webhook secret to `.env`
- [ ] Test payment flow end-to-end
- [ ] Test refund flow
- [ ] Verify webhook events are received
- [ ] Enable payment methods (UPI, Cards, Net Banking, Wallets)
- [ ] Set up payment notifications
- [ ] Configure payment retry logic
- [ ] Set up monitoring and alerts

## Support Payment Methods

Razorpay supports:
- Credit/Debit Cards (Visa, Mastercard, Rupay, Amex)
- UPI (Google Pay, PhonePe, Paytm, BHIM)
- Net Banking (All major banks)
- Wallets (Paytm, PhonePe, Amazon Pay, Mobikwik)
- EMI (Credit Card EMI, Cardless EMI)

## Monitoring

### Key Metrics to Track
- Payment success rate
- Payment failure rate
- Average payment time
- Refund rate
- Webhook delivery success rate

### Logs to Monitor
- Order creation logs
- Payment verification logs
- Webhook event logs
- Refund processing logs

## Troubleshooting

### Payment Not Completing
1. Check if Razorpay script is loaded
2. Verify Key ID in frontend .env
3. Check browser console for errors
4. Verify order creation API is working

### Signature Verification Failing
1. Verify Key Secret in backend .env
2. Check if order_id and payment_id are correct
3. Ensure signature is not modified in transit

### Webhooks Not Received
1. Verify webhook URL is accessible
2. Check webhook secret configuration
3. Verify webhook events are enabled in dashboard
4. Check server logs for webhook errors

## Additional Resources

- [Razorpay Documentation](https://razorpay.com/docs/)
- [Razorpay API Reference](https://razorpay.com/docs/api/)
- [Razorpay Webhooks](https://razorpay.com/docs/webhooks/)
- [Razorpay Test Cards](https://razorpay.com/docs/payments/payments/test-card-details/)

## Notes

- Always use HTTPS in production
- Never expose Key Secret in frontend code
- Always verify payment signatures
- Implement idempotency for payment operations
- Store payment logs for audit purposes
- Implement retry logic for failed webhooks
- Set up alerts for payment failures
- Regular reconciliation with Razorpay dashboard
