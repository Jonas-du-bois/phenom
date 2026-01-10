import webpush from 'web-push';
import PushSubscription from '../models/PushSubscription.js';

// Configure VAPID keys from env
const VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY || '';
const CONTACT_EMAIL = process.env.VAPID_CONTACT || 'mailto:admin@phenom.app';

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webpush.setVapidDetails(CONTACT_EMAIL, VAPID_PUBLIC, VAPID_PRIVATE);
} else {
  console.warn('⚠️ VAPID keys not configured. Web Push will fail until keys are set.');
}

async function sendPushToSubscription(subscription, payload) {
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
    return true;
  } catch (err) {
    // If subscription is gone or invalid, caller should handle removal
    console.error('❌ WebPush send error:', err && err.statusCode, err?.body || err?.message);
    throw err;
  }
}

async function notifyUserPush(userId, payload) {
  const subs = await PushSubscription.find({ userId });
  const results = [];
  for (const s of subs) {
    try {
      await sendPushToSubscription(s.subscription, payload);
      results.push({ subscriptionId: s._id, success: true });
    } catch (err) {
      // If gone (410) remove subscription
      if (err && err.statusCode === 410) {
        await PushSubscription.findByIdAndDelete(s._id);
        results.push({ subscriptionId: s._id, success: false, removed: true });
      } else {
        results.push({ subscriptionId: s._id, success: false });
      }
    }
  }
  return results;
}

export default {
  sendPushToSubscription,
  notifyUserPush
};
