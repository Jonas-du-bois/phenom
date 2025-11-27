#!/usr/bin/env node

/**
 * @file generate-ai-images.js
 * @description Script de génération d'images IA pour les observations sans images.
 *
 * Ce script scanne la base de données pour trouver les observations qui n'ont pas
 * d'images et génère automatiquement des illustrations via l'API Gemini.
 *
 * Usage:
 *   node scripts/generate-ai-images.js [options]
 *
 * Options:
 *   --limit=N    Nombre maximum d'observations à traiter (défaut: 10)
 *   --dry-run    Affiche les observations sans générer d'images
 *
 * Exemples:
 *   node scripts/generate-ai-images.js
 *   node scripts/generate-ai-images.js --limit=5
 *   node scripts/generate-ai-images.js --dry-run
 *
 * Variables d'environnement requises:
 *   - MONGODB_URI: URI de connexion MongoDB
 *   - GEMINI_API_KEY: Clé API Google Gemini
 *   - CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import mongoose from 'mongoose';

// Charger les variables d'environnement
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Cherche d'abord dans backend/.env, sinon dans la racine du projet
const envPath = resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

// Import des modèles et services après le chargement de .env
import Observation from '../src/models/Observation.js';
import imageService from '../src/services/image.service.js';

// ============================================================================
// Configuration
// ============================================================================

const DEFAULT_LIMIT = 10;
const DELAY_BETWEEN_GENERATIONS_MS = 2000; // Délai entre chaque génération (rate limiting)

// ============================================================================
// Utilitaires
// ============================================================================

/**
 * Parse les arguments de ligne de commande
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    limit: DEFAULT_LIMIT,
    dryRun: false
  };

  for (const arg of args) {
    if (arg.startsWith('--limit=')) {
      options.limit = parseInt(arg.split('=')[1], 10) || DEFAULT_LIMIT;
    }
    if (arg === '--dry-run') {
      options.dryRun = true;
    }
  }

  return options;
}

/**
 * Affiche un séparateur visuel dans la console
 */
function separator() {
  console.log('─'.repeat(60));
}

/**
 * Pause l'exécution pendant un délai donné
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================================
// Logique principale
// ============================================================================

/**
 * Trouve les observations sans images
 */
async function findObservationsWithoutImages(limit) {
  const observations = await Observation.find({
    $or: [
      { images: { $exists: false } },
      { images: { $size: 0 } }
    ]
  })
    .limit(limit)
    .select('_id title description type tags location createdAt')
    .lean();

  return observations;
}

/**
 * Génère une image IA pour une observation et la sauvegarde
 */
async function generateAndSaveImage(observation) {
  const observationId = observation._id.toString();

  console.log(`\n🎨 Génération pour: "${observation.title}"`);
  console.log(`   ID: ${observationId}`);
  console.log(`   Type: ${observation.type || 'non défini'}`);

  try {
    // Générer l'image via le service
    const aiImage = await imageService.generateAiImage(
      {
        title: observation.title,
        description: observation.description,
        type: observation.type,
        tags: observation.tags,
        location: observation.location
      },
      observationId
    );

    // Mettre à jour l'observation avec l'image générée
    await Observation.findByIdAndUpdate(observationId, {
      $push: { images: aiImage }
    });

    console.log('   ✅ Image générée et sauvegardée');
    console.log(`   📎 URL: ${aiImage.url}`);

    return { success: true, observationId, url: aiImage.url };

  } catch (error) {
    console.log(`   ❌ Échec: ${error.message}`);
    return { success: false, observationId, error: error.message };
  }
}

/**
 * Point d'entrée principal
 */
async function main() {
  const options = parseArgs();

  console.log('\n');
  separator();
  console.log('🤖 GÉNÉRATEUR D\'IMAGES IA POUR OBSERVATIONS');
  separator();
  console.log('📊 Configuration:');
  console.log(`   - Limite: ${options.limit} observations`);
  console.log(`   - Mode: ${options.dryRun ? 'DRY RUN (pas de génération)' : 'PRODUCTION'}`);
  console.log(`   - Délai entre générations: ${DELAY_BETWEEN_GENERATIONS_MS}ms`);
  separator();

  // Vérifier les variables d'environnement requises
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI non définie dans .env');
    process.exit(1);
  }

  if (!options.dryRun && !process.env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY non définie dans .env');
    process.exit(1);
  }

  // Connexion à MongoDB
  console.log('📡 Connexion à MongoDB...');
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');
  } catch (error) {
    console.error('❌ Erreur de connexion MongoDB:', error.message);
    process.exit(1);
  }

  // Rechercher les observations sans images
  console.log('\n🔍 Recherche des observations sans images...');
  const observations = await findObservationsWithoutImages(options.limit);

  if (observations.length === 0) {
    console.log('✅ Aucune observation sans image trouvée !');
    await mongoose.disconnect();
    process.exit(0);
  }

  console.log(`📋 ${observations.length} observation(s) trouvée(s) sans image\n`);

  // Mode dry-run : afficher seulement les observations
  if (options.dryRun) {
    console.log('📝 Mode DRY RUN - Observations qui seraient traitées:');
    separator();
    for (const obs of observations) {
      console.log(`\n  📌 "${obs.title}"`);
      console.log(`     ID: ${obs._id}`);
      console.log(`     Type: ${obs.type || 'non défini'}`);
      console.log(`     Description: ${obs.description.substring(0, 100)}...`);
    }
    separator();
    console.log('\n✅ Fin du dry run. Aucune image générée.');
    await mongoose.disconnect();
    process.exit(0);
  }

  // Générer les images
  separator();
  console.log('🚀 Début de la génération des images IA...');

  const results = {
    success: 0,
    failed: 0,
    details: []
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

    // Attendre avant la prochaine génération (rate limiting)
    if (i < observations.length - 1) {
      console.log(`   ⏳ Attente ${DELAY_BETWEEN_GENERATIONS_MS}ms...`);
      await sleep(DELAY_BETWEEN_GENERATIONS_MS);
    }
  }

  // Résumé final
  console.log('\n');
  separator();
  console.log('📊 RÉSUMÉ DE L\'EXÉCUTION');
  separator();
  console.log(`   ✅ Succès: ${results.success}`);
  console.log(`   ❌ Échecs: ${results.failed}`);
  console.log(`   📋 Total: ${observations.length}`);

  if (results.failed > 0) {
    console.log('\n   Détails des échecs:');
    results.details
      .filter(r => !r.success)
      .forEach(r => {
        console.log(`   - ${r.observationId}: ${r.error}`);
      });
  }

  separator();
  console.log('✅ Script terminé\n');

  // Déconnexion
  await mongoose.disconnect();
  process.exit(results.failed > 0 ? 1 : 0);
}

// Exécution
main().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});
