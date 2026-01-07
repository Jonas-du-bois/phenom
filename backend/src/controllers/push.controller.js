import PushSubscription from '../models/PushSubscription.js';
import { successResponse, errorResponse } from '../utils/response.js';
import webpushService from '../services/webpush.service.js';

/**
 * Push notification controller
 * Handles Web Push subscription management and VAPID public key retrieval
 */
class PushController {
  /**
   * Subscribes a user to push notifications
   * POST /api/v1/push/subscribe
   */
  async subscribe(req, res, next) {
    try {
      const userId = req.user._id;
      const { subscription } = req.body;
      if (!subscription) {
        return errorResponse(res, 'Subscription object is required', 400);
      }

      // Upsert: update if subscription endpoint exists, otherwise create new
      const existing = await PushSubscription.findOne({
        userId,
        'subscription.endpoint': subscription.endpoint
      });
      if (existing) {
        existing.subscription = subscription;
        await existing.save();
        return successResponse(
          res,
          { id: existing._id },
          'Subscription updated'
        );
      }

      const doc = await PushSubscription.create({ userId, subscription });
      return successResponse(res, { id: doc._id }, 'Subscription created');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Unsubscribes a user from push notifications
   * POST /api/v1/push/unsubscribe
   */
  async unsubscribe(req, res, next) {
    try {
      const userId = req.user._id;
      const { endpoint } = req.body;
      if (!endpoint) return errorResponse(res, 'endpoint required', 400);
      await PushSubscription.deleteMany({
        userId,
        'subscription.endpoint': endpoint
      });
      return successResponse(res, null, 'Unsubscribed');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Retrieves the VAPID public key for client-side subscription
   * GET /api/v1/push/public-key
   */
  async publicKey(req, res, next) {
    try {
      const key =
        process.env.VAPID_PUBLIC_KEY || process.env.VITE_VAPID_PUBLIC || '';
      return successResponse(res, { publicKey: key });
    } catch (error) {
      next(error);
    }
  }
}

export default new PushController();
