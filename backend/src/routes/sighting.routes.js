import express from 'express';
import observationService from '../services/observation.service.js';
import { successResponse } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Sightings
 *   description: API Phenom Search compatible - Observations publiques
 */

/**
 * @swagger
 * /api/v1/sightings/paginated:
 *   get:
 *     summary: Liste paginée des observations (format Phenom Search)
 *     tags: [Sightings]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Numéro de page (commence à 1)
 *       - in: query
 *         name: perPage
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 500
 *           default: 50
 *         description: Nombre d'observations par page
 *     responses:
 *       200:
 *         description: Observations récupérées avec succès
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
 *                     $ref: '#/components/schemas/Sighting'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     perPage:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     hasNextPage:
 *                       type: boolean
 *                     hasPrevPage:
 *                       type: boolean
 */
router.get('/paginated', asyncHandler(async (req, res) => {
  const { page = 1, perPage = 50 } = req.query;
  const result = await observationService.getSightingsPaginated(page, perPage);
  return res.status(200).json({
    success: true,
    data: result.data,
    pagination: result.pagination
  });
}));

/**
 * @swagger
 * /api/v1/sightings:
 *   get:
 *     summary: Recherche avancée avec filtres (format Phenom Search)
 *     tags: [Sightings]
 *     parameters:
 *       - in: query
 *         name: country
 *         schema:
 *           type: string
 *         description: Filtrer par pays (recherche partielle)
 *       - in: query
 *         name: locale
 *         schema:
 *           type: string
 *         description: Type de localité
 *       - in: query
 *         name: startYear
 *         schema:
 *           type: integer
 *         description: Année minimum
 *       - in: query
 *         name: endYear
 *         schema:
 *           type: integer
 *         description: Année maximum
 *       - in: query
 *         name: minCredibility
 *         schema:
 *           type: integer
 *           minimum: 0
 *           maximum: 15
 *         description: Crédibilité minimale
 *       - in: query
 *         name: maxCredibility
 *         schema:
 *           type: integer
 *           minimum: 0
 *           maximum: 15
 *         description: Crédibilité maximale
 *       - in: query
 *         name: minStrangeness
 *         schema:
 *           type: integer
 *           minimum: 0
 *           maximum: 10
 *         description: Étrangeté minimale
 *       - in: query
 *         name: maxStrangeness
 *         schema:
 *           type: integer
 *           minimum: 0
 *           maximum: 10
 *         description: Étrangeté maximale
 *       - in: query
 *         name: minDuration
 *         schema:
 *           type: integer
 *         description: Durée minimale (secondes)
 *       - in: query
 *         name: maxDuration
 *         schema:
 *           type: integer
 *         description: Durée maximale (secondes)
 *       - in: query
 *         name: observerType
 *         schema:
 *           type: string
 *         description: Code(s) d'observateur (ex "GND,MIL")
 *       - in: query
 *         name: ufoShape
 *         schema:
 *           type: string
 *         description: Code(s) de forme (ex "SCR,CIG")
 *       - in: query
 *         name: phenomenon
 *         schema:
 *           type: string
 *         description: Code(s) de phénomène (ex "RAY,LND")
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Recherche textuelle dans description/location
 *       - in: query
 *         name: hasCoordinates
 *         schema:
 *           type: boolean
 *         description: Filtrer par présence de coordonnées GPS
 *       - in: query
 *         name: hasImages
 *         schema:
 *           type: boolean
 *         description: Filtrer par présence d'images (Phenom App)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 500
 *           default: 50
 *         description: Nombre de résultats
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Position de départ
 *     responses:
 *       200:
 *         description: Observations filtrées récupérées avec succès
 */
router.get('/', asyncHandler(async (req, res) => {
  const result = await observationService.getSightingsWithFilters(req.query);
  return res.status(200).json({
    success: true,
    data: result.data,
    pagination: result.pagination
  });
}));

/**
 * @swagger
 * /api/v1/sightings/{id}:
 *   get:
 *     summary: Détails d'une observation (format Phenom Search)
 *     tags: [Sightings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'observation
 *     responses:
 *       200:
 *         description: Observation récupérée avec succès
 *       404:
 *         description: Observation non trouvée
 */
router.get('/:id', asyncHandler(async (req, res) => {
  const sighting = await observationService.getSightingById(req.params.id);
  return successResponse(res, sighting);
}));

export default router;
