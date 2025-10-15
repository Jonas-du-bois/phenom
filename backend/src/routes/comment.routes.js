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
 * @route   GET /api/v1/observations/:id/comments
 * @desc    Récupère les commentaires d'une observation
 * @access  Public
 */
router.get(
  '/observations/:id/comments',
  getCommentsValidation,
  validate,
  commentController.getComments
);

/**
 * @route   POST /api/v1/observations/:id/comments
 * @desc    Ajoute un commentaire à une observation
 * @access  Private
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
 * @route   PUT /api/v1/comments/:id
 * @desc    Met à jour un commentaire
 * @access  Private (Propriétaire ou Admin)
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
 * @route   DELETE /api/v1/comments/:id
 * @desc    Supprime un commentaire
 * @access  Private (Propriétaire ou Admin)
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
