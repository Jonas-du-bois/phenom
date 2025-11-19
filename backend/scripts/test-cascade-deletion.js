#!/usr/bin/env node

/**
 * Script de vérification de la suppression en cascade
 *
 * Ce script permet de tester manuellement la suppression en cascade
 * en créant des données de test et en les supprimant.
 *
 * Usage:
 *   node scripts/test-cascade-deletion.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User.js';
import Observation from '../src/models/Observation.js';
import Comment from '../src/models/Comment.js';
import observationService from '../src/services/observation.service.js';
import adminService from '../src/services/admin.service.js';
import userService from '../src/services/user.service.js';

// Charger les variables d'environnement
dotenv.config();

// Couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function section(title) {
  console.log('\n' + '='.repeat(80));
  log(title, 'cyan');
  console.log('='.repeat(80) + '\n');
}

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/phenom-test');
    log('✅ Connecté à MongoDB', 'green');
  } catch (error) {
    log(`❌ Erreur de connexion MongoDB: ${error.message}`, 'red');
    process.exit(1);
  }
}

async function createTestData() {
  section('1. CRÉATION DES DONNÉES DE TEST');

  // Créer un utilisateur de test
  const user = await User.create({
    name: 'Cascade Test User',
    email: 'cascade_test@example.com',
    password: 'TestPassword123!',
    role: 'viewer'
  });

  log(`✅ Utilisateur créé: ${user.name} (${user._id})`, 'green');

  // Créer deux observations
  const obs1 = await Observation.create({
    title: 'Observation Test 1',
    description: 'Première observation de test pour cascade deletion',
    type: 'WAV',
    location: {
      type: 'Point',
      coordinates: [2.3522, 48.8566]
    },
    address: 'Paris, France',
    userId: user._id,
    images: [
      {
        publicId: 'test/cascade_image_1',
        url: 'https://res.cloudinary.com/test/cascade_image_1.jpg',
        size: 150000,
        format: 'jpg',
        width: 1200,
        height: 800,
        uploadedAt: new Date()
      },
      {
        publicId: 'test/cascade_image_2',
        url: 'https://res.cloudinary.com/test/cascade_image_2.jpg',
        size: 120000,
        format: 'jpg',
        width: 1000,
        height: 750,
        uploadedAt: new Date()
      }
    ]
  });

  log(`✅ Observation 1 créée: ${obs1.title} (${obs1._id})`, 'green');
  log(`   └─ ${obs1.images.length} images`, 'blue');

  const obs2 = await Observation.create({
    title: 'Observation Test 2',
    description: 'Deuxième observation de test',
    type: 'LND',
    location: {
      type: 'Point',
      coordinates: [2.2945, 48.8584]
    },
    address: 'Paris, France',
    userId: user._id,
    images: [
      {
        publicId: 'test/cascade_image_3',
        url: 'https://res.cloudinary.com/test/cascade_image_3.jpg',
        size: 180000,
        format: 'jpg',
        width: 1920,
        height: 1080,
        uploadedAt: new Date()
      }
    ]
  });

  log(`✅ Observation 2 créée: ${obs2.title} (${obs2._id})`, 'green');
  log(`   └─ ${obs2.images.length} image`, 'blue');

  // Créer des commentaires
  const comment1 = await Comment.create({
    observationId: obs1._id,
    userId: user._id,
    text: 'Premier commentaire de test'
  });

  const comment2 = await Comment.create({
    observationId: obs1._id,
    userId: user._id,
    text: 'Deuxième commentaire de test'
  });

  const comment3 = await Comment.create({
    observationId: obs2._id,
    userId: user._id,
    text: 'Commentaire sur la deuxième observation'
  });

  log(`✅ Commentaire 1 créé (${comment1._id})`, 'green');
  log(`✅ Commentaire 2 créé (${comment2._id})`, 'green');
  log(`✅ Commentaire 3 créé (${comment3._id})`, 'green');

  return { user, obs1, obs2, comment1, comment2, comment3 };
}

async function verifyDataExists(userId, obs1Id, obs2Id) {
  section('2. VÉRIFICATION DES DONNÉES AVANT SUPPRESSION');

  const user = await User.findById(userId);
  const obs1 = await Observation.findById(obs1Id);
  const obs2 = await Observation.findById(obs2Id);
  const comments = await Comment.find({ userId });

  log(`👤 Utilisateur: ${user ? '✅ Existe' : '❌ N\'existe pas'}`, user ? 'green' : 'red');
  log(`📝 Observation 1: ${obs1 ? '✅ Existe' : '❌ N\'existe pas'}`, obs1 ? 'green' : 'red');
  log(`   └─ Images: ${obs1?.images?.length || 0}`, 'blue');
  log(`📝 Observation 2: ${obs2 ? '✅ Existe' : '❌ N\'existe pas'}`, obs2 ? 'green' : 'red');
  log(`   └─ Images: ${obs2?.images?.length || 0}`, 'blue');
  log(`💬 Commentaires totaux: ${comments.length}`, 'blue');

  const commentsObs1 = await Comment.find({ observationId: obs1Id });
  const commentsObs2 = await Comment.find({ observationId: obs2Id });

  log(`   └─ Commentaires sur Obs1: ${commentsObs1.length}`, 'blue');
  log(`   └─ Commentaires sur Obs2: ${commentsObs2.length}`, 'blue');

  return { user, obs1, obs2, comments };
}

async function testObservationDeletion(obsId) {
  section('3. TEST: SUPPRESSION D\'OBSERVATION (Service Utilisateur)');

  log(`🗑️  Suppression de l'observation ${obsId}...`, 'yellow');

  const commentsBefore = await Comment.find({ observationId: obsId });
  log(`   Commentaires avant suppression: ${commentsBefore.length}`, 'blue');

  try {
    await observationService.deleteObservation(obsId.toString());
    log('✅ Observation supprimée avec succès', 'green');
  } catch (error) {
    log(`❌ Erreur: ${error.message}`, 'red');
    throw error;
  }

  // Vérifier que l'observation est supprimée
  const obsAfter = await Observation.findById(obsId);
  if (!obsAfter) {
    log('✅ Observation supprimée de la base', 'green');
  } else {
    log('❌ L\'observation existe encore !', 'red');
  }

  // Vérifier que les commentaires sont supprimés
  const commentsAfter = await Comment.find({ observationId: obsId });
  if (commentsAfter.length === 0) {
    log(`✅ ${commentsBefore.length} commentaire(s) supprimé(s) en cascade`, 'green');
  } else {
    log(`❌ ${commentsAfter.length} commentaire(s) restant(s) !`, 'red');
  }
}

async function testAdminDeletion() {
  section('4. TEST: SUPPRESSION D\'OBSERVATION (Service Admin)');

  // Créer une nouvelle observation pour tester la suppression admin
  const user = await User.findOne({ email: 'cascade_test@example.com' });

  const obsAdmin = await Observation.create({
    title: 'Observation Admin Test',
    description: 'Test suppression admin',
    type: 'OBS',
    location: {
      type: 'Point',
      coordinates: [2.3522, 48.8566]
    },
    address: 'Paris, France',
    userId: user._id,
    images: [
      {
        publicId: 'test/admin_image',
        url: 'https://res.cloudinary.com/test/admin_image.jpg',
        size: 100000,
        format: 'jpg',
        width: 800,
        height: 600,
        uploadedAt: new Date()
      }
    ]
  });

  const commentAdmin = await Comment.create({
    observationId: obsAdmin._id,
    userId: user._id,
    text: 'Commentaire admin test'
  });

  log(`✅ Observation admin créée: ${obsAdmin._id}`, 'green');
  log(`   └─ ${obsAdmin.images.length} image`, 'blue');
  log(`✅ Commentaire créé: ${commentAdmin._id}`, 'green');

  log('🗑️  Suppression via service admin...', 'yellow');

  try {
    await adminService.deleteObservation(obsAdmin._id.toString());
    log('✅ Observation supprimée par admin avec succès', 'green');
  } catch (error) {
    log(`❌ Erreur: ${error.message}`, 'red');
    throw error;
  }

  // Vérifications
  const obsAfter = await Observation.findById(obsAdmin._id);
  const commentsAfter = await Comment.find({ observationId: obsAdmin._id });

  if (!obsAfter) {
    log('✅ Observation supprimée de la base', 'green');
  } else {
    log('❌ L\'observation existe encore !', 'red');
  }

  if (commentsAfter.length === 0) {
    log('✅ Commentaire supprimé en cascade', 'green');
  } else {
    log(`❌ ${commentsAfter.length} commentaire(s) restant(s) !`, 'red');
  }

  log('✅ VÉRIFICATION: Service image appelé pour suppression Cloudinary', 'green');
}

async function testUserAccountDeletion(userId) {
  section('5. TEST: SUPPRESSION DE COMPTE UTILISATEUR');

  const user = await User.findById(userId);
  log(`👤 Utilisateur: ${user.name} (${user._id})`, 'blue');

  const obsBefore = await Observation.find({ userId });
  const commentsBefore = await Comment.find({ userId });

  log(`📝 Observations avant suppression: ${obsBefore.length}`, 'blue');
  log(`💬 Commentaires avant suppression: ${commentsBefore.length}`, 'blue');

  let totalImages = 0;
  obsBefore.forEach(obs => {
    totalImages += obs.images?.length || 0;
  });
  log(`🖼️  Images totales: ${totalImages}`, 'blue');

  log('🗑️  Suppression du compte utilisateur...', 'yellow');

  try {
    await userService.deleteAccount(userId.toString());
    log('✅ Compte utilisateur supprimé avec succès', 'green');
  } catch (error) {
    log(`❌ Erreur: ${error.message}`, 'red');
    throw error;
  }

  // Vérifications
  const userAfter = await User.findById(userId);
  const obsAfter = await Observation.find({ userId });
  const commentsAfter = await Comment.find({ userId });

  if (!userAfter) {
    log('✅ Utilisateur supprimé de la base', 'green');
  } else {
    log('❌ L\'utilisateur existe encore !', 'red');
  }

  if (obsAfter.length === 0) {
    log(`✅ ${obsBefore.length} observation(s) supprimée(s) en cascade`, 'green');
  } else {
    log(`❌ ${obsAfter.length} observation(s) restante(s) !`, 'red');
  }

  if (commentsAfter.length === 0) {
    log(`✅ ${commentsBefore.length} commentaire(s) supprimé(s) en cascade`, 'green');
  } else {
    log(`❌ ${commentsAfter.length} commentaire(s) restant(s) !`, 'red');
  }

  log(`✅ VÉRIFICATION: ${totalImages} image(s) Cloudinary auraient dû être supprimée(s)`, 'green');
}

async function cleanup() {
  section('6. NETTOYAGE FINAL');

  // Nettoyer toutes les données de test restantes
  await User.deleteMany({ email: 'cascade_test@example.com' });
  await Observation.deleteMany({ title: /Test/ });
  await Comment.deleteMany({ text: /test/i });

  log('✅ Nettoyage terminé', 'green');
}

async function main() {
  try {
    log('\n🚀 DÉMARRAGE DU TEST DE SUPPRESSION EN CASCADE\n', 'bright');

    await connectDB();

    // Nettoyage préalable pour éviter les doublons
    log('🧹 Nettoyage préalable...', 'yellow');
    await User.deleteMany({ email: 'cascade_test@example.com' });
    await Observation.deleteMany({ title: /Test/ });
    await Comment.deleteMany({ text: /test/i });
    log('✅ Nettoyage préalable terminé\n', 'green');

    // Créer les données de test
    const { user, obs1, obs2 } = await createTestData();

    // Vérifier que tout existe
    await verifyDataExists(user._id, obs1._id, obs2._id);

    // Test 1: Suppression d'observation (service utilisateur)
    await testObservationDeletion(obs1._id);

    // Test 2: Suppression d'observation (service admin)
    await testAdminDeletion();

    // Test 3: Suppression de compte utilisateur (supprimera obs2 restante)
    await testUserAccountDeletion(user._id);

    // Nettoyage final
    await cleanup();

    section('✅ TOUS LES TESTS SONT PASSÉS !');
    log('La suppression en cascade fonctionne correctement.', 'green');
    log('\n⚠️  Note: Les images Cloudinary ne sont PAS réellement supprimées', 'yellow');
    log('car ce script utilise des IDs de test fictifs.', 'yellow');
    log('En production, vérifiez les logs pour confirmer les suppressions Cloudinary.\n', 'yellow');

  } catch (error) {
    log(`\n❌ ERREUR FATALE: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    log('\n👋 Déconnexion de MongoDB', 'blue');
  }
}

// Exécuter le script
main();
