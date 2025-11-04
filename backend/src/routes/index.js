import express from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import observationRoutes from './observation.routes.js';
import commentRoutes from './comment.routes.js';
import adminRoutes from './admin.routes.js';
import imageRoutes from './image.routes.js';

const router = express.Router();

// Routes d'authentification
router.use('/auth', authRoutes);

// Routes des utilisateurs
router.use('/users', userRoutes);

// Routes des images (AVANT observations pour éviter les conflits de routes)
router.use('/', imageRoutes);

// Routes des observations
router.use('/observations', observationRoutes);

// Routes des commentaires
router.use('/', commentRoutes);

// Routes d'administration
router.use('/admin', adminRoutes);

export default router;
