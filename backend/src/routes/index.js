/**
 * @file index.js
 * @description Main router that aggregates all API route modules.
 * Compatible with both Phenom App and Phenom Search.
 */
import express from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import observationRoutes from './observation.routes.js';
import commentRoutes from './comment.routes.js';
import pushRoutes from './push.routes.js';
import adminRoutes from './admin.routes.js';
import imageRoutes from './image.routes.js';
import filterRoutes from './filter.routes.js';

const router = express.Router();

// ============================================
// PHENOM API - Unified Observation Routes
// Compatible with both Phenom App and Phenom Search
// ============================================

// Filter routes (available values for UI dropdowns)
router.use('/filters', filterRoutes);

// Authentication routes
router.use('/auth', authRoutes);

// User routes
router.use('/users', userRoutes);

// Push notification subscriptions
router.use('/push', pushRoutes);

// Image routes
router.use('/', imageRoutes);

// Observation routes (CRUD + advanced filters + statistics)
// Public: GET (read)
// Protected: POST/PUT/DELETE (create/update/delete)
router.use('/observations', observationRoutes);

// Comment routes
router.use('/', commentRoutes);

// Administration routes
router.use('/admin', adminRoutes);

export default router;
