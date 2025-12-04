import express from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import observationRoutes from './observation.routes.js';
import commentRoutes from './comment.routes.js';
import adminRoutes from './admin.routes.js';
import imageRoutes from './image.routes.js';
import sightingRoutes from './sighting.routes.js';
import filterRoutes from './filter.routes.js';
import statisticsRoutes from './statistics.routes.js';

const router = express.Router();

// ============================================
// PHENOM SEARCH COMPATIBLE ROUTES (Public)
// ============================================

// Routes des sightings (format Phenom Search)
router.use('/sightings', sightingRoutes);

// Routes des filtres (format Phenom Search)
router.use('/filters', filterRoutes);

// Routes des statistiques (format Phenom Search)
router.use('/statistics', statisticsRoutes);

// ============================================
// PHENOM APP ROUTES (Social features)
// ============================================

// Routes d'authentification
router.use('/auth', authRoutes);

// Routes des utilisateurs
router.use('/users', userRoutes);

// Routes des images
router.use('/', imageRoutes);

// Routes des observations (CRUD avec auth)
router.use('/observations', observationRoutes);

// Routes des commentaires
router.use('/', commentRoutes);

// Routes d'administration
router.use('/admin', adminRoutes);

export default router;
