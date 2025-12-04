import express from 'express';
import observationService from '../services/observation.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Statistics
 *   description: API Phenom Search compatible - Statistiques globales
 */

/**
 * @swagger
 * /api/v1/statistics:
 *   get:
 *     summary: Statistiques globales du dataset (format Phenom Search)
 *     tags: [Statistics]
 *     responses:
 *       200:
 *         description: Statistiques récupérées avec succès
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
 *                     totalSightings:
 *                       type: integer
 *                       example: 18116
 *                     credibilityStats:
 *                       type: object
 *                       properties:
 *                         min:
 *                           type: integer
 *                         max:
 *                           type: integer
 *                         avg:
 *                           type: string
 *                     strangenessStats:
 *                       type: object
 *                       properties:
 *                         min:
 *                           type: integer
 *                         max:
 *                           type: integer
 *                         avg:
 *                           type: string
 *                     durationStats:
 *                       type: object
 *                       properties:
 *                         min:
 *                           type: integer
 *                         max:
 *                           type: integer
 *                         avg:
 *                           type: string
 *                     topCountries:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           country:
 *                             type: string
 *                           count:
 *                             type: integer
 *                     observerTypeDistribution:
 *                       type: object
 *                     ufoShapeDistribution:
 *                       type: object
 *                     sightingsWithCoordinates:
 *                       type: integer
 *                     sightingsWithImages:
 *                       type: integer
 */
router.get('/', asyncHandler(async (req, res) => {
  const stats = await observationService.getStatistics();
  return res.status(200).json({
    success: true,
    data: stats
  });
}));

export default router;
