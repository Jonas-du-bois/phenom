import express from 'express';
import pushController from '../controllers/push.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/subscribe', authenticate, pushController.subscribe);
router.post('/unsubscribe', authenticate, pushController.unsubscribe);
router.get('/public-key', pushController.publicKey);

export default router;
