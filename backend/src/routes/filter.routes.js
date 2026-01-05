/**
 * @file filter.routes.js
 * @description Filter routes for retrieving available filter values.
 * Provides lists of countries, locales, observer types, UFO shapes, and phenomena.
 * Compatible with Phenom Search API format.
 */
import express from "express";
import observationService from "../services/observation.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Filters
 *   description: API Phenom Search compatible - Valeurs de filtres disponibles
 */

/**
 * @swagger
 * /api/v1/filters/countries:
 *   get:
 *     summary: Liste des pays disponibles
 *     tags: [Filters]
 *     responses:
 *       200:
 *         description: Liste des pays
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 */
router.get(
  "/countries",
  asyncHandler(async (req, res) => {
    const countries = await observationService.getFilterValues("countries");
    return res.status(200).json({
      success: true,
      data: countries,
    });
  })
);

/**
 * @swagger
 * /api/v1/filters/locales:
 *   get:
 *     summary: Types de localités disponibles
 *     tags: [Filters]
 *     responses:
 *       200:
 *         description: Liste des types de localités
 */
router.get(
  "/locales",
  asyncHandler(async (req, res) => {
    const locales = await observationService.getFilterValues("locales");
    return res.status(200).json({
      success: true,
      data: locales,
    });
  })
);

/**
 * @swagger
 * /api/v1/filters/observer-types:
 *   get:
 *     summary: Types d'observateurs disponibles
 *     tags: [Filters]
 *     responses:
 *       200:
 *         description: Liste des types d'observateurs avec descriptions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       code:
 *                         type: string
 *                         example: GND
 *                       description:
 *                         type: string
 *                         example: Ground Observers - Observateur(s) au sol
 */
router.get(
  "/observer-types",
  asyncHandler(async (req, res) => {
    const types = await observationService.getFilterValues("observer-types");
    return res.status(200).json({
      success: true,
      data: types,
    });
  })
);

/**
 * @swagger
 * /api/v1/filters/ufo-shapes:
 *   get:
 *     summary: Formes d'OVNI disponibles
 *     tags: [Filters]
 *     responses:
 *       200:
 *         description: Liste des formes avec descriptions
 */
router.get(
  "/ufo-shapes",
  asyncHandler(async (req, res) => {
    const shapes = await observationService.getFilterValues("ufo-shapes");
    return res.status(200).json({
      success: true,
      data: shapes,
    });
  })
);

/**
 * @swagger
 * /api/v1/filters/phenomena:
 *   get:
 *     summary: Phénomènes disponibles
 *     tags: [Filters]
 *     responses:
 *       200:
 *         description: Liste des phénomènes avec descriptions
 */
router.get(
  "/phenomena",
  asyncHandler(async (req, res) => {
    const phenomena = await observationService.getFilterValues("phenomena");
    return res.status(200).json({
      success: true,
      data: phenomena,
    });
  })
);

export default router;
