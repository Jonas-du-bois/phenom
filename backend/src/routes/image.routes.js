import express from 'express';
import multer from 'multer';
import imageController from '../controllers/image.controller.js';
import { authenticate } from '../middleware/auth.js';
import { param } from 'express-validator';
import { validate } from '../middleware/validate.js';

const router = express.Router();

const observationIdValidation = [
  param('observationId').isMongoId().withMessage('ID d\'observation invalide')
];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
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
 *     summary: Upload une image pour une observation (stockage Cloudinary)
 *     description: Upload une image qui sera compressée et stockée sur Cloudinary. L'image aura une URL publique directe.
 *     tags: [Images]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: observationId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID MongoDB de l'observation
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Fichier image (JPEG, PNG, WebP) - Max 10MB
 *     responses:
 *       201:
 *         description: Image uploadée avec succès sur Cloudinary
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Image uploadée avec succès
 *                 data:
 *                   type: object
 *                   properties:
 *                     publicId:
 *                       type: string
 *                       description: Public ID Cloudinary de l'image
 *                       example: phenom/observations/507f1f77bcf86cd799439011_1699876543210
 *                     url:
 *                       type: string
 *                       description: URL HTTPS publique de l'image sur Cloudinary
 *                       example: https://res.cloudinary.com/dgsfd1fic/image/upload/v1699876543/phenom/observations/507f1f77bcf86cd799439011_1699876543210.jpg
 *                     format:
 *                       type: string
 *                       example: jpg
 *                     size:
 *                       type: number
 *                       description: Taille en octets (après compression)
 *                       example: 245678
 *                     width:
 *                       type: number
 *                       example: 1920
 *                     height:
 *                       type: number
 *                       example: 1080
 *                     compression:
 *                       type: object
 *                       properties:
 *                         originalSize:
 *                           type: number
 *                         compressedSize:
 *                           type: number
 *                         ratio:
 *                           type: number
 *                         savedBytes:
 *                           type: number
 *       400:
 *         description: Aucune image fournie ou format invalide
 *       403:
 *         description: Non autorisé - l'observation ne vous appartient pas
 *       404:
 *         description: Observation non trouvée
 */
router.post('/observations/:observationId/images', authenticate, upload.single('image'), imageController.uploadImage);

/**
 * @swagger
 * /api/v1/observations/{observationId}/images:
 *   get:
 *     summary: Liste les images d'une observation
 *     description: Retourne toutes les images avec leurs URLs Cloudinary publiques
 *     tags: [Images]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: observationId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID MongoDB de l'observation
 *     responses:
 *       200:
 *         description: Liste des images avec URLs Cloudinary
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       publicId:
 *                         type: string
 *                         example: phenom/observations/507f1f77bcf86cd799439011_1699876543210
 *                       url:
 *                         type: string
 *                         example: https://res.cloudinary.com/dgsfd1fic/image/upload/v1699876543/phenom/observations/507f1f77bcf86cd799439011_1699876543210.jpg
 *                       size:
 *                         type: number
 *                         example: 245678
 *                       format:
 *                         type: string
 *                         example: jpg
 *                       width:
 *                         type: number
 *                         example: 1920
 *                       height:
 *                         type: number
 *                         example: 1080
 *                       uploadedAt:
 *                         type: string
 *                         format: date-time
 *       404:
 *         description: Observation non trouvée
 */
router.get('/observations/:observationId/images', authenticate, observationIdValidation, validate, imageController.listImages);

/**
 * @swagger
 * /api/v1/observations/{observationId}/images/{publicId}:
 *   put:
 *     summary: Modifie/remplace une image existante
 *     description: Remplace une image existante par une nouvelle. L'ancienne sera supprimée de Cloudinary et la nouvelle sera uploadée avec compression.
 *     tags: [Images]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: observationId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID MongoDB de l'observation
 *       - in: path
 *         name: publicId
 *         required: true
 *         schema:
 *           type: string
 *         description: Public ID Cloudinary de l'image à remplacer (URL-encodé)
 *         example: phenom%2Fobservations%2F507f1f77bcf86cd799439011_1699876543210
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Nouvelle image (JPEG, PNG, WebP) - Max 10MB
 *     responses:
 *       200:
 *         description: Image modifiée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Image modifiée avec succès
 *                 data:
 *                   type: object
 *                   properties:
 *                     publicId:
 *                       type: string
 *                       example: phenom/observations/507f1f77bcf86cd799439011_1699876543222
 *                     url:
 *                       type: string
 *                       example: https://res.cloudinary.com/dgsfd1fic/image/upload/v1699876543/phenom/observations/507f1f77bcf86cd799439011_1699876543222.jpg
 *                     format:
 *                       type: string
 *                       example: jpg
 *                     size:
 *                       type: number
 *                       example: 245678
 *                     width:
 *                       type: number
 *                       example: 1920
 *                     height:
 *                       type: number
 *                       example: 1080
 *       400:
 *         description: Aucune image fournie
 *       403:
 *         description: Non autorisé
 *       404:
 *         description: Observation ou image non trouvée
 */
router.put('/observations/:observationId/images/:publicId', authenticate, upload.single('image'), imageController.updateImage);

/**
 * @swagger
 * /api/v1/observations/{observationId}/images/{publicId}:
 *   delete:
 *     summary: Supprime une image de Cloudinary et de l'observation
 *     description: Supprime définitivement l'image. Le publicId doit être URL-encodé car il contient des slashes.
 *     tags: [Images]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: observationId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID MongoDB de l'observation
 *       - in: path
 *         name: publicId
 *         required: true
 *         schema:
 *           type: string
 *         description: Public ID Cloudinary (doit être URL-encodé, ex. phenom%2Fobservations%2F507f1f77bcf86cd799439011_1699876543210)
 *         example: phenom%2Fobservations%2F507f1f77bcf86cd799439011_1699876543210
 *     responses:
 *       200:
 *         description: Image supprimée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Image supprimée avec succès
 *       403:
 *         description: Non autorisé - l'observation ne vous appartient pas (sauf admin)
 *       404:
 *         description: Image ou observation non trouvée
 */
router.delete('/observations/:observationId/images/:publicId', authenticate, observationIdValidation, validate, imageController.deleteImage);

export default router;
