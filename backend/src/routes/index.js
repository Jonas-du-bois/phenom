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

// Routes des filtres (valeurs disponibles pour l'UI)
router.use('/filters', filterRoutes);

// Routes d'authentification
router.use('/auth', authRoutes);

// Routes des utilisateurs
router.use('/users', userRoutes);

// Push subscriptions
router.use('/push', pushRoutes);

// Routes des images
router.use('/', imageRoutes);

// Routes des observations (CRUD + filtres avancés + statistiques)
// Public: GET (lecture)
// Protected: POST/PUT/DELETE (création/modification/suppression)
router.use('/observations', observationRoutes);

// Routes des commentaires
router.use('/', commentRoutes);

// Routes d'administration
router.use('/admin', adminRoutes);

export default router;
