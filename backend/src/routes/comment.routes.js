import express from 'express';
import commentController from '../controllers/comment.controller.js';
import { authenticate } from '../middleware/auth.js';
import { isOwnerOrAdmin } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import {
  createCommentValidation,
  updateCommentValidation,
  getCommentsValidation,
  commentIdValidation
} from '../validators/comment.validator.js';
import { createLimiter } from '../middleware/rateLimiter.js';
import commentService from '../services/comment.service.js';

const router = express.Router();

/**
 * @swagger
 * /api/v1/observations/{id}/comments:
 *   get:
 *     summary: Récupère les commentaires d'une observation
 *     tags: [Commentaires]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'observation
 *         example: 507f1f77bcf86cd799439011
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Numéro de page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Nombre de commentaires par page
 *     responses:
 *       200:
 *         description: Commentaires récupérés avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     comments:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Comment'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           example: 10
 *                         total:
 *                           type: integer
 *                           example: 42
 *                         pages:
 *                           type: integer
 *                           example: 5
 *       400:
 *         description: ID invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Observation non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/observations/:id/comments',
  getCommentsValidation,
  validate,
  commentController.getComments
);

/**
 * @swagger
 * /api/v1/observations/{id}/comments:
 *   post:
 *     summary: Ajoute un commentaire à une observation
 *     tags: [Commentaires]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'observation
 *         example: 507f1f77bcf86cd799439011
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 500
 *                 example: Très intéressante cette observation !
 *     responses:
 *       201:
 *         description: |
 *           Commentaire créé avec succès
 *
 *           **🔌 WebSocket**: Un événement `comment:created` est automatiquement diffusé
 *           sur le canal WebSocket `comments` à tous les clients connectés.
 *
 *           Format du message WebSocket:
 *           ```json
 *           {
 *             "type": "comment:created",
 *             "data": {
 *               "comment": { "commentaire complet avec tous les champs" },
 *               "observationId": "507f1f77bcf86cd799439011"
 *             },
 *             "timestamp": "2025-11-03T12:34:56.789Z"
 *           }
 *           ```
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
 *                   example: Commentaire créé avec succès
 *                 data:
 *                   $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Données invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Non authentifié
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Observation non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Trop de commentaires (rate limit)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/observations/:id/comments',
  authenticate,
  createLimiter,
  createCommentValidation,
  validate,
  commentController.createComment
);

/**
 * @swagger
 * /api/v1/comments/{id}:
 *   put:
 *     summary: Met à jour un commentaire
 *     tags: [Commentaires]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du commentaire
 *         example: 507f1f77bcf86cd799439011
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 500
 *                 example: Commentaire mis à jour
 *     responses:
 *       200:
 *         description: |
 *           Commentaire mis à jour avec succès
 *
 *           **🔌 WebSocket**: Un événement `comment:updated` est automatiquement diffusé
 *           sur le canal WebSocket `comments` à tous les clients connectés.
 *
 *           Format du message WebSocket:
 *           ```json
 *           {
 *             "type": "comment:updated",
 *             "data": {
 *               "comment": { "commentaire mis à jour avec tous les champs" },
 *               "observationId": "507f1f77bcf86cd799439011"
 *             },
 *             "timestamp": "2025-11-03T12:34:56.789Z"
 *           }
 *           ```
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
 *                   example: Commentaire mis à jour avec succès
 *                 data:
 *                   $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Données invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Non authentifié
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Non autorisé (pas propriétaire ni admin)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Commentaire non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put(
  '/comments/:id',
  authenticate,
  updateCommentValidation,
  validate,
  isOwnerOrAdmin(async (req) => {
    return await commentService.getCommentOwnerId(req.params.id);
  }),
  commentController.updateComment
);

/**
 * @swagger
 * /api/v1/comments/{id}:
 *   delete:
 *     summary: Supprime un commentaire
 *     tags: [Commentaires]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du commentaire
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: |
 *           Commentaire supprimé avec succès
 *
 *           **🔌 WebSocket**: Un événement `comment:deleted` est automatiquement diffusé
 *           sur le canal WebSocket `comments` à tous les clients connectés.
 *
 *           Format du message WebSocket:
 *           ```json
 *           {
 *             "type": "comment:deleted",
 *             "data": {
 *               "commentId": "507f1f77bcf86cd799439011",
 *               "observationId": "507f1f77bcf86cd799439011"
 *             },
 *             "timestamp": "2025-11-03T12:34:56.789Z"
 *           }
 *           ```
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
 *                   example: Commentaire supprimé avec succès
 *       400:
 *         description: ID invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Non authentifié
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Non autorisé (pas propriétaire ni admin)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Commentaire non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete(
  '/comments/:id',
  authenticate,
  commentIdValidation,
  validate,
  isOwnerOrAdmin(async (req) => {
    return await commentService.getCommentOwnerId(req.params.id);
  }),
  commentController.deleteComment
);

export default router;
