const cron = require('node-cron');
const Subscription = require('../models/Subscription');
const Order = require('../models/Order');
const User = require('../models/User');
const { notifyRenewalOrderCreated } = require('./notificationService');

/**
 * Subscription Expiry Job
 *
 * Runs daily at midnight. Checks for active subscriptions expiring within
 * the next 24 hours. For each expiring subscription that has no open
 * (non-delivered) order, creates a renewal order and notifies the admin.
 *
 * Duplicate prevention: skips subscriptions that already have an open order.
 * Error isolation: errors on individual subscriptions are logged and skipped
 * without stopping the rest of the job.
 */
const runExpiryCheck = async () => {
  console.log('[SubscriptionExpiryJob] Starting expiry check...');

  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);

  let processed = 0;
  let created = 0;
  let skipped = 0;
  let errors = 0;

  try {
    const expiringSubs = await Subscription.find({
      status: 'active',
      endDate: { $lte: tomorrow }
    }).populate('bundleId');

    processed = expiringSubs.length;
    console.log(`[SubscriptionExpiryJob] Found ${processed} expiring subscription(s).`);

    const admin = await User.findOne({ userType: 'admin' });

    for (const sub of expiringSubs) {
      try {
        // Duplicate prevention: check for any open (non-delivered) order
        const openOrder = await Order.findOne({
          subscriptionId: sub._id,
          status: { $ne: 'delivered' }
        });

        if (openOrder) {
          console.log(`[SubscriptionExpiryJob] Skipping sub ${sub._id} — open order already exists.`);
          skipped++;
          continue;
        }

        // Build orderedBundles from the populated bundle
        const bundleName = sub.bundleId?.name || 'Bundle';
        const orderedBundles = [{
          bundleTypeId: sub.bundleId?._id || sub.bundleId,
          bundleName,
          quantity: 1
        }];

        const renewalOrder = await Order.create({
          userId: sub.userId,
          subscriptionId: sub._id,
          orderedBundles,
          builtBundles: [],
          status: 'pending',
          orderType: 'renewal'
        });

        if (admin) {
          await notifyRenewalOrderCreated(admin._id, renewalOrder);
        }

        console.log(`[SubscriptionExpiryJob] Created renewal order ${renewalOrder._id} for sub ${sub._id}.`);
        created++;
      } catch (subError) {
        console.error(`[SubscriptionExpiryJob] Error processing sub ${sub._id}:`, subError.message);
        errors++;
      }
    }
  } catch (jobError) {
    console.error('[SubscriptionExpiryJob] Fatal error during expiry check:', jobError.message);
  }

  console.log(
    `[SubscriptionExpiryJob] Done. Processed: ${processed}, Created: ${created}, Skipped: ${skipped}, Errors: ${errors}`
  );
};

/**
 * Start the cron job — runs at midnight every day (0 0 * * *)
 */
const start = () => {
  cron.schedule('0 0 * * *', runExpiryCheck, {
    scheduled: true,
    timezone: 'Asia/Kolkata'
  });
  console.log('[SubscriptionExpiryJob] Scheduled — runs daily at midnight.');
};

module.exports = { start, runExpiryCheck };
