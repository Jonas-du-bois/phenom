/**
 * @file observation.routes.js
 * @description Observation routes for CRUD operations, search, and statistics.
 * Supports geospatial queries, advanced filtering, and AI image generation.
 */
import express from "express";
import observationController from "../controllers/observation.controller.js";
import { authenticate } from "../middleware/auth.js";
import { isOwnerOrAdmin } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";
import {
  createObservationValidation,
  updateObservationValidation,
  getObservationsValidation,
  idParamValidation,
  nearbyObservationsValidation,
} from "../validators/observation.validator.js";
import { createLimiter } from "../middleware/rateLimiter.js";
import observationService from "../services/observation.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = express.Router();

/**
 * @swagger
 * /api/v1/observations/nearby:
 *   get:
 *     summary: Recherche d'observations à proximité
 *     tags: [Observations]
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: number
 *           minimum: -90
 *           maximum: 90
 *         description: Latitude (WGS84)
 *         example: 46.5197
 *       - in: query
 *         name: lng
 *         required: true
 *         schema:
 *           type: number
 *           minimum: -180
 *           maximum: 180
 *         description: Longitude (WGS84)
 *         example: 6.6323
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           minimum: 1
 *           default: 10000
 *         description: Rayon de recherche en mètres (défaut 10km)
 *         example: 5000
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Nombre maximum d'observations à retourner
 *     responses:
 *       200:
 *         description: Observations à proximité trouvées
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
 *                     allOf:
 *                       - $ref: '#/components/schemas/Observation'
 *                       - type: object
 *                         properties:
 *                           distance:
 *                             type: number
 *                             description: Distance en mètres
 *                             example: 1234.56
 *       400:
 *         description: Paramètres invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  "/nearby",
  nearbyObservationsValidation,
  validate,
  observationController.getNearbyObservations
);

/**
 * @swagger
 * /api/v1/observations/stats:
 *   get:
 *     summary: Récupère les statistiques publiques des observations
 *     tags: [Observations]
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
 *                     total:
 *                       type: integer
 *                       example: 1234
 *                     lastWeek:
 *                       type: integer
 *                       example: 42
 *                     lastMonth:
 *                       type: integer
 *                       example: 156
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/stats", observationController.getObservationStats);

/**
 * @swagger
 * /api/v1/observations/statistics:
 *   get:
 *     summary: Statistiques globales détaillées (format Phenom Search)
 *     tags: [Observations]
 *     description: |
 *       Retourne des statistiques complètes sur le dataset d'observations,
 *       compatibles avec le format Phenom Search API.
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
router.get(
  "/statistics",
  asyncHandler(async (req, res) => {
    const stats = await observationService.getStatistics();
    return res.status(200).json({
      success: true,
      data: stats,
    });
  })
);

/**
 * @swagger
 * /api/v1/observations/popular-types:
 *   get:
 *     summary: Récupère les types d'observations les plus populaires
 *     tags: [Observations]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 20
 *           default: 6
 *         description: Nombre de types à retourner
 *     responses:
 *       200:
 *         description: Types populaires récupérés avec succès
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
 *                       type:
 *                         type: string
 *                         example: WAV
 *                       count:
 *                         type: integer
 *                         example: 156
 *       500:
 *         description: Erreur serveur
 */
router.get("/popular-types", observationController.getPopularTypes);

/**
 * @swagger
 * /api/v1/observations:
 *   get:
 *     summary: Récupère la liste des observations avec filtres avancés
 *     description: |
 *       Endpoint unifié pour récupérer les observations avec pagination et filtres.
 *       Compatible avec le format Phenom Search API.
 *
 *       **Fonctionnalités:**
 *       - Pagination flexible (page/limit ou offset/limit)
 *       - Filtres par pays, locale, dates, credibility, strangeness
 *       - Filtres par types d'observateurs, formes d'OVNI, phénomènes
 *       - Recherche textuelle dans la description et le lieu
 *       - Tri personnalisable
 *     tags: [Observations]
 *     parameters:
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
 *           maximum: 500
 *           default: 50
 *         description: Nombre d'observations par page
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Position de départ (alternative à page)
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt, date, credibility, strangeness]
 *           default: createdAt
 *         description: Champ de tri
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Ordre de tri
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Recherche textuelle dans description et location
 *       - in: query
 *         name: country
 *         schema:
 *           type: string
 *         description: Filtrer par pays (recherche partielle)
 *       - in: query
 *         name: locale
 *         schema:
 *           type: string
 *         description: Type de localité (CITY, RURAL, MOUNTAIN, etc.)
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
 *         description: Crédibilité minimale (0-15)
 *       - in: query
 *         name: maxCredibility
 *         schema:
 *           type: integer
 *           minimum: 0
 *           maximum: 15
 *         description: Crédibilité maximale (0-15)
 *       - in: query
 *         name: minStrangeness
 *         schema:
 *           type: integer
 *           minimum: 0
 *           maximum: 10
 *         description: Étrangeté minimale (0-10)
 *       - in: query
 *         name: maxStrangeness
 *         schema:
 *           type: integer
 *           minimum: 0
 *           maximum: 10
 *         description: Étrangeté maximale (0-10)
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
 *         description: Code(s) d'observateur séparés par virgule (ex "GND,MIL")
 *       - in: query
 *         name: ufoShape
 *         schema:
 *           type: string
 *         description: Code(s) de forme séparés par virgule (ex "SCR,CIG")
 *       - in: query
 *         name: phenomenon
 *         schema:
 *           type: string
 *         description: Code(s) de phénomène séparés par virgule (ex "RAY,LND")
 *       - in: query
 *         name: hasCoordinates
 *         schema:
 *           type: boolean
 *         description: Filtrer par présence de coordonnées GPS
 *       - in: query
 *         name: hasImages
 *         schema:
 *           type: boolean
 *         description: Filtrer par présence d'images
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filtrer par utilisateur (MongoDB ObjectId)
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
 *                   type: object
 *                   properties:
 *                     observations:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Observation'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           example: 50
 *                         total:
 *                           type: integer
 *                           example: 234
 *                         totalPages:
 *                           type: integer
 *                           example: 5
 *                         hasNextPage:
 *                           type: boolean
 *                         hasPrevPage:
 *                           type: boolean
 *       400:
 *         description: Paramètres invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  "/",
  getObservationsValidation,
  validate,
  observationController.getObservations
);

/**
 * @swagger
 * /api/v1/observations:
 *   post:
 *     summary: Crée une nouvelle observation
 *     description: |
 *       Crée une nouvelle observation d'OVNI/phénomène.
 *       Utilise le format Phenom Search compatible pour la structure de données.
 *
 *       **Champs requis:** date, location, country, description, coordinates
 *
 *       **Fonctionnalités sociales:** Les images peuvent être ajoutées via l'endpoint dédié
 *       après la création de l'observation.
 *     tags: [Observations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *               - location
 *               - country
 *               - description
 *               - coordinates
 *             properties:
 *               date:
 *                 type: string
 *                 description: Date de l'observation (YYYY-MM-DD)
 *                 example: "2024-03-15"
 *               time:
 *                 type: string
 *                 description: Heure de l'observation (HH:MM)
 *                 example: "22:30"
 *               location:
 *                 type: string
 *                 description: Lieu de l'observation
 *                 example: "Lausanne, Vaud"
 *               country:
 *                 type: string
 *                 description: Pays
 *                 example: "Suisse"
 *               locale:
 *                 type: string
 *                 enum: [Town & City, Rural, Mountains, Farmlands, Coastal, Desert, Forest, Lake/River, Ocean, Airport, Military Base, Unknown]
 *                 example: "Town & City"
 *               coordinates:
 *                 type: object
 *                 required:
 *                   - lat
 *                   - lng
 *                 properties:
 *                   lat:
 *                     type: number
 *                     minimum: -90
 *                     maximum: 90
 *                     example: 46.5197
 *                   lng:
 *                     type: number
 *                     minimum: -180
 *                     maximum: 180
 *                     example: 6.6323
 *               description:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 5000
 *                 example: "J'ai observé un objet triangulaire lumineux se déplaçant silencieusement au-dessus de la ville pendant environ 2 minutes."
 *               credibility:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 15
 *                 default: 5
 *                 description: Score de crédibilité (0-15)
 *               strangeness:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 10
 *                 default: 5
 *                 description: Score d'étrangeté (0-10)
 *               duration:
 *                 type: integer
 *                 description: Durée en secondes
 *                 example: 120
 *               observerTypes:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [GND, MIL, CIV, HQO, SCI, CST, SEA, NWS]
 *                 example: ["GND", "CIV"]
 *               ufoShapes:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [SCR, CIG, DLT, NLT, FBL, FIG, PRB, NFO]
 *                 example: ["DLT"]
 *               phenomena:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["NTL", "HST"]
 *     responses:
 *       201:
 *         description: |
 *           Observation créée avec succès
 *
 *           **🔌 WebSocket**: Un événement `observation:created` est automatiquement diffusé
 *           sur le canal WebSocket `observations` à tous les clients connectés.
 *
 *           Format du message WebSocket:
 *           ```json
 *           {
 *             "type": "observation:created",
 *             "data": { "observation complète avec tous les champs" },
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
 *                   example: Observation créée avec succès
 *                 data:
 *                   $ref: '#/components/schemas/Observation'
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
 *       429:
 *         description: Trop de créations (rate limit)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  "/",
  authenticate,
  createLimiter,
  createObservationValidation,
  validate,
  observationController.createObservation
);

/**
 * @swagger
 * /api/v1/observations/{id}:
 *   get:
 *     summary: Récupère une observation par son ID
 *     tags: [Observations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'observation (MongoDB ObjectId)
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Observation récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Observation'
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
  "/:id",
  idParamValidation,
  validate,
  observationController.getObservationById
);

/**
 * @swagger
 * /api/v1/observations/{id}:
 *   put:
 *     summary: Met à jour une observation
 *     description: |
 *       Met à jour une observation existante. Seul le propriétaire ou un admin peut modifier.
 *       Utilise le format Phenom Search compatible.
 *     tags: [Observations]
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
 *             properties:
 *               date:
 *                 type: string
 *                 description: Date de l'observation (YYYY-MM-DD)
 *                 example: "2024-03-15"
 *               time:
 *                 type: string
 *                 example: "22:30"
 *               location:
 *                 type: string
 *                 example: "Lausanne, Vaud"
 *               country:
 *                 type: string
 *                 example: "Suisse"
 *               locale:
 *                 type: string
 *                 enum: [Town & City, Rural, Mountains, Farmlands, Coastal, Desert, Forest, Lake/River, Ocean, Airport, Military Base, Unknown]
 *               coordinates:
 *                 type: object
 *                 properties:
 *                   lat:
 *                     type: number
 *                   lng:
 *                     type: number
 *               description:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 5000
 *               credibility:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 15
 *               strangeness:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 10
 *               duration:
 *                 type: integer
 *               observerTypes:
 *                 type: array
 *                 items:
 *                   type: string
 *               ufoShapes:
 *                 type: array
 *                 items:
 *                   type: string
 *               phenomena:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: |
 *           Observation mise à jour avec succès
 *
 *           **🔌 WebSocket**: Un événement `observation:updated` est automatiquement diffusé
 *           sur le canal WebSocket `observations` à tous les clients connectés.
 *
 *           Format du message WebSocket:
 *           ```json
 *           {
 *             "type": "observation:updated",
 *             "data": { "observation mise à jour avec tous les champs" },
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
 *                   example: Observation mise à jour avec succès
 *                 data:
 *                   $ref: '#/components/schemas/Observation'
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
 *         description: Observation non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put(
  "/:id",
  authenticate,
  updateObservationValidation,
  validate,
  isOwnerOrAdmin(async (req) => {
    return await observationService.getObservationOwnerId(req.params.id);
  }),
  observationController.updateObservation
);

/**
 * @swagger
 * /api/v1/observations/{id}:
 *   delete:
 *     summary: Supprime une observation
 *     tags: [Observations]
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
 *     responses:
 *       200:
 *         description: |
 *           Observation supprimée avec succès
 *
 *           **🔌 WebSocket**: Un événement `observation:deleted` est automatiquement diffusé
 *           sur le canal WebSocket `observations` à tous les clients connectés.
 *
 *           Format du message WebSocket:
 *           ```json
 *           {
 *             "type": "observation:deleted",
 *             "data": { "observationId": "507f1f77bcf86cd799439011" },
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
 *                   example: Observation supprimée avec succès
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
 *         description: Observation non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete(
  "/:id",
  authenticate,
  idParamValidation,
  validate,
  isOwnerOrAdmin(async (req) => {
    return await observationService.getObservationOwnerId(req.params.id);
  }),
  observationController.deleteObservation
);

/**
 * @swagger
 * /api/v1/observations/{id}/generate-ai-image:
 *   post:
 *     summary: Génère une image IA pour une observation existante
 *     description: |
 *       Utilise l'API Gemini pour générer une illustration basée sur le titre,
 *       la description et le type de l'observation. L'image est uploadée sur Cloudinary
 *       et ajoutée à la liste des images de l'observation avec `source: 'ai'`.
 *
 *       Nécessite d'être le propriétaire de l'observation ou administrateur.
 *     tags: [Observations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'observation (MongoDB ObjectId)
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Image IA générée et ajoutée avec succès
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
 *                   example: Image IA générée avec succès
 *                 data:
 *                   $ref: '#/components/schemas/Observation'
 *       400:
 *         description: ID invalide
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Non autorisé (pas propriétaire ni admin)
 *       404:
 *         description: Observation non trouvée
 *       500:
 *         description: Erreur lors de la génération de l'image IA
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Échec de la génération d'image IA: GEMINI_API_KEY non configurée"
 */
router.post(
  "/:id/generate-ai-image",
  authenticate,
  idParamValidation,
  validate,
  isOwnerOrAdmin(async (req) => {
    return await observationService.getObservationOwnerId(req.params.id);
  }),
  observationController.generateAiImage
);

export default router;
