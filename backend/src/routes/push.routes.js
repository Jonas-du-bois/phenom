/**
 * @file push.routes.js
 * @description Push notification routes for Web Push subscription management.
 * Handles subscribe, unsubscribe, and VAPID public key retrieval.
 */
import express from 'express';
import pushController from '../controllers/push.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Subscribe to push notifications (requires authentication)
router.post('/subscribe', authenticate, pushController.subscribe);

// Unsubscribe from push notifications (requires authentication)
router.post('/unsubscribe', authenticate, pushController.unsubscribe);

// Get VAPID public key (public endpoint for client-side subscription)
router.get('/public-key', pushController.publicKey);

export default router;
