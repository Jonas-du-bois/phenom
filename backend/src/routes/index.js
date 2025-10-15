import express from 'express';
import authRoutes from './auth.routes.js';
import observationRoutes from './observation.routes.js';
import commentRoutes from './comment.routes.js';
import adminRoutes from './admin.routes.js';

const router = express.Router();

// Routes d'authentification
router.use('/auth', authRoutes);

// Routes des observations
router.use('/observations', observationRoutes);

// Routes des commentaires
router.use('/', commentRoutes);

// Routes d'administration
router.use('/admin', adminRoutes);

export default router;
