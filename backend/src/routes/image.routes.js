import express from 'express';
import multer from 'multer';
import imageController from '../controllers/image.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Configuration Multer pour upload en mémoire (buffer)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
    files: 1
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Type de fichier non autorisé. Types acceptés: JPEG, PNG, WebP'), false);
    }
  }
});

/**
 * @swagger
 * /api/v1/observations/{observationId}/images:
 *   post:
 *     summary: Upload une image pour une observation
 *     tags: [Images]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: observationId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Image uploadée avec succès
 *       400:
 *         description: Aucune image fournie
 *       403:
 *         description: Non autorisé
 *       404:
 *         description: Observation non trouvée
 */
router.post('/observations/:observationId/images', authenticate, upload.single('image'), imageController.uploadImage);

/**
 * @swagger
 * /api/v1/observations/{observationId}/images:
 *   get:
 *     summary: Liste les images d'une observation
 *     tags: [Images]
 *     parameters:
 *       - in: path
 *         name: observationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des images
 *       404:
 *         description: Observation non trouvée
 */
router.get('/observations/:observationId/images', imageController.listImages);

/**
 * @swagger
 * /api/v1/images/{imageId}:
 *   get:
 *     summary: Récupère une image
 *     tags: [Images]
 *     parameters:
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Image récupérée
 *         content:
 *           image/jpeg:
 *             schema:
 *               type: string
 *               format: binary
 *           image/png:
 *             schema:
 *               type: string
 *               format: binary
 *           image/webp:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Image non trouvée
 */
router.get('/images/:imageId', imageController.getImage);

/**
 * @swagger
 * /api/v1/observations/{observationId}/images/{imageId}:
 *   delete:
 *     summary: Supprime une image
 *     tags: [Images]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: observationId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Image supprimée
 *       403:
 *         description: Non autorisé
 *       404:
 *         description: Image ou observation non trouvée
 */
router.delete('/observations/:observationId/images/:imageId', authenticate, imageController.deleteImage);

export default router;
