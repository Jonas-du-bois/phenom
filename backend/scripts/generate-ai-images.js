#!/usr/bin/env node

/**
 * @file generate-ai-images.js
 * @description Script to generate AI images for observations without images.
 *
 * This script scans the database to find observations that don't have
 * images and automatically generates illustrations via the Gemini API.
 *
 * Usage:
 *   node scripts/generate-ai-images.js [options]
 *
 * Options:
 *   --limit=N    Maximum number of observations to process (default: 10)
 *   --dry-run    Display observations without generating images
 *
 * Examples:
 *   node scripts/generate-ai-images.js
 *   node scripts/generate-ai-images.js --limit=5
 *   node scripts/generate-ai-images.js --dry-run
 *
 * Required environment variables:
 *   - MONGODB_URI: MongoDB connection URI
 *   - GEMINI_API_KEY: Google Gemini API key
 *   - CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
 */

import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import mongoose from "mongoose";

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// First look in backend/.env, otherwise in project root
const envPath = resolve(__dirname, "../.env");
dotenv.config({ path: envPath });

// Import models and services after loading .env
import Observation from "../src/models/Observation.js";
import imageService from "../src/services/image.service.js";

// ============================================================================
// Configuration
// ============================================================================

const DEFAULT_LIMIT = 10;
const DELAY_BETWEEN_GENERATIONS_MS = 2000; // Delay between each generation (rate limiting)

// ============================================================================
// Utilities
// ============================================================================

/**
 * Parses command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    limit: DEFAULT_LIMIT,
    dryRun: false,
  };

  for (const arg of args) {
    if (arg.startsWith("--limit=")) {
      options.limit = parseInt(arg.split("=")[1], 10) || DEFAULT_LIMIT;
    }
    if (arg === "--dry-run") {
      options.dryRun = true;
    }
  }

  return options;
}

/**
 * Displays a visual separator in the console
 */
function separator() {
  console.log("─".repeat(60));
}

/**
 * Pauses execution for a given delay
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================================
// Main Logic
// ============================================================================

/**
 * Finds observations without images
 */
async function findObservationsWithoutImages(limit) {
  const observations = await Observation.find({
    $or: [{ images: { $exists: false } }, { images: { $size: 0 } }],
  })
    .limit(limit)
    .select("_id title description type tags location createdAt")
    .lean();

  return observations;
}

/**
 * Generates an AI image for an observation and saves it
 */
async function generateAndSaveImage(observation) {
  const observationId = observation._id.toString();

  console.log(`\n🎨 Génération pour: "${observation.title}"`);
  console.log(`   ID: ${observationId}`);
  console.log(`   Type: ${observation.type || "non défini"}`);

  try {
    // Generate image via service
    const aiImage = await imageService.generateAiImage(
      {
        title: observation.title,
        description: observation.description,
        type: observation.type,
        tags: observation.tags,
        location: observation.location,
      },
      observationId
    );

    // Update observation with generated image
    await Observation.findByIdAndUpdate(observationId, {
      $push: { images: aiImage },
    });

    console.log("   ✅ Image générée et sauvegardée");
    console.log(`   📎 URL: ${aiImage.url}`);

    return { success: true, observationId, url: aiImage.url };
  } catch (error) {
    console.log(`   ❌ Échec: ${error.message}`);
    return { success: false, observationId, error: error.message };
  }
}

/**
 * Main entry point
 */
async function main() {
  const options = parseArgs();

  console.log("\n");
  separator();
  console.log("🤖 GÉNÉRATEUR D'IMAGES IA POUR OBSERVATIONS");
  separator();
  console.log("📊 Configuration:");
  console.log(`   - Limite: ${options.limit} observations`);
  console.log(
    `   - Mode: ${
      options.dryRun ? "DRY RUN (pas de génération)" : "PRODUCTION"
    }`
  );
  console.log(
    `   - Délai entre générations: ${DELAY_BETWEEN_GENERATIONS_MS}ms`
  );
  separator();

  // Check required environment variables
  if (!process.env.MONGODB_URI) {
    console.error("❌ MONGODB_URI non définie dans .env");
    process.exit(1);
  }

  if (!options.dryRun && !process.env.GEMINI_API_KEY) {
    console.error("❌ GEMINI_API_KEY non définie dans .env");
    process.exit(1);
  }

  // Connect to MongoDB
  console.log("📡 Connexion à MongoDB...");
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connecté à MongoDB");
  } catch (error) {
    console.error("❌ Erreur de connexion MongoDB:", error.message);
    process.exit(1);
  }

  // Search for observations without images
  console.log("\n🔍 Recherche des observations sans images...");
  const observations = await findObservationsWithoutImages(options.limit);

  if (observations.length === 0) {
    console.log("✅ Aucune observation sans image trouvée !");
    await mongoose.disconnect();
    process.exit(0);
  }

  console.log(
    `📋 ${observations.length} observation(s) trouvée(s) sans image\n`
  );

  // Dry-run mode: only display observations
  if (options.dryRun) {
    console.log("📝 Mode DRY RUN - Observations qui seraient traitées:");
    separator();
    for (const obs of observations) {
      console.log(`\n  📌 "${obs.title}"`);
      console.log(`     ID: ${obs._id}`);
      console.log(`     Type: ${obs.type || "non défini"}`);
      console.log(`     Description: ${obs.description.substring(0, 100)}...`);
    }
    separator();
    console.log("\n✅ Fin du dry run. Aucune image générée.");
    await mongoose.disconnect();
    process.exit(0);
  }

  // Generate images
  separator();
  console.log("🚀 Début de la génération des images IA...");

  const results = {
    success: 0,
    failed: 0,
    details: [],
  };

  for (let i = 0; i < observations.length; i++) {
    const observation = observations[i];
    console.log(`\n[${i + 1}/${observations.length}]`);

    const result = await generateAndSaveImage(observation);
    results.details.push(result);

    if (result.success) {
      results.success++;
    } else {
      results.failed++;
    }

    // Wait before next generation (rate limiting)
    if (i < observations.length - 1) {
      console.log(`   ⏳ Attente ${DELAY_BETWEEN_GENERATIONS_MS}ms...`);
      await sleep(DELAY_BETWEEN_GENERATIONS_MS);
    }
  }

  // Final summary
  console.log("\n");
  separator();
  console.log("📊 RÉSUMÉ DE L'EXÉCUTION");
  separator();
  console.log(`   ✅ Succès: ${results.success}`);
  console.log(`   ❌ Échecs: ${results.failed}`);
  console.log(`   📋 Total: ${observations.length}`);

  if (results.failed > 0) {
    console.log("\n   Détails des échecs:");
    results.details
      .filter((r) => !r.success)
      .forEach((r) => {
        console.log(`   - ${r.observationId}: ${r.error}`);
      });
  }

  separator();
  console.log("✅ Script terminé\n");

  // Disconnect
  await mongoose.disconnect();
  process.exit(results.failed > 0 ? 1 : 0);
}

// Execution
main().catch((error) => {
  console.error("❌ Erreur fatale:", error);
  process.exit(1);
});
