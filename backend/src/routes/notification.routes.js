/**
 * @file notification.routes.js
 * @description Notification routes for managing user alerts.
 * All routes require authentication.
 */
import express from 'express';
import notificationController from '../controllers/notification.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/v1/notifications:
 *   get:
 *     summary: Récupère les notifications de l'utilisateur connecté
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numéro de page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *           maximum: 100
 *         description: Nombre de notifications par page
 *       - in: query
 *         name: unreadOnly
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Ne retourner que les notifications non lues
 *     responses:
 *       200:
 *         description: Liste des notifications
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
 *                     notifications:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Notification'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         pages:
 *                           type: integer
 *                     unreadCount:
 *                       type: integer
 *       401:
 *         description: Non authentifié
 */
router.get('/', authenticate, notificationController.getNotifications);

/**
 * @swagger
 * /api/v1/notifications/unread-count:
 *   get:
 *     summary: Récupère le nombre de notifications non lues
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Nombre de notifications non lues
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
 *                     count:
 *                       type: integer
 *       401:
 *         description: Non authentifié
 */
router.get('/unread-count', authenticate, notificationController.getUnreadCount);

/**
 * @swagger
 * /api/v1/notifications/mark-all-read:
 *   post:
 *     summary: Marque toutes les notifications comme lues
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Toutes les notifications marquées comme lues
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
 *                   example: Toutes les notifications marquées comme lues
 *                 data:
 *                   type: object
 *                   properties:
 *                     modifiedCount:
 *                       type: integer
 *       401:
 *         description: Non authentifié
 */
router.post('/mark-all-read', authenticate, notificationController.markAllAsRead);

/**
 * @swagger
 * /api/v1/notifications/read:
 *   delete:
 *     summary: Supprime toutes les notifications lues
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notifications lues supprimées
 *       401:
 *         description: Non authentifié
 */
router.delete('/read', authenticate, notificationController.deleteAllRead);

/**
 * @swagger
 * /api/v1/notifications/{id}/read:
 *   patch:
 *     summary: Marque une notification comme lue
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la notification
 *     responses:
 *       200:
 *         description: Notification marquée comme lue
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Notification non trouvée
 */
router.patch('/:id/read', authenticate, notificationController.markAsRead);

/**
 * @swagger
 * /api/v1/notifications/{id}:
 *   delete:
 *     summary: Supprime une notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la notification
 *     responses:
 *       200:
 *         description: Notification supprimée
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Notification non trouvée
 */
router.delete('/:id', authenticate, notificationController.deleteNotification);

export default router;
