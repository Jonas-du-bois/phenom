import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { connectDB, disconnectDB } from '../src/config/database.js';
import { initGridFS } from '../src/config/gridfs.js';
import User from '../src/models/User.js';
import Observation from '../src/models/Observation.js';
import Comment from '../src/models/Comment.js';

// Import des seeders modulaires
import seedAdmin from './seed/seeders/seed-admin.js';
import seedUsers from './seed/seeders/seed-users.js';
import seedObservations from './seed/seeders/seed-observations.js';
import seedComments from './seed/seeders/seed-comments.js';

// Charger les variables d'environnement
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, '../../.env'); // Racine du projet (phenom/.env)
dotenv.config({ path: envPath });

/**
 * Script principal pour peupler la base de données MongoDB Atlas
 * Architecture modulaire avec séparation des responsabilités
 */
const seedDatabase = async () => {
  try {
    console.log('╔════════════════════════════════════════════════════╗');
    console.log('║     SEED DE LA BASE DE DONNÉES PHENOM              ║');
    console.log('╚════════════════════════════════════════════════════╝\n');

    // 1. Connexion à MongoDB Atlas
    console.log('🔌 Connexion à MongoDB Atlas...');
    await connectDB();

    // 2. Initialisation de GridFS pour les images
    console.log('📦 Initialisation de GridFS...');
    initGridFS();

    // 3. Nettoyage des collections existantes
    console.log('\n🧹 Nettoyage des collections...');
    await Promise.all([
      User.deleteMany({}),
      Observation.deleteMany({}),
      Comment.deleteMany({})
    ]);

    // Nettoyer GridFS (images)
    const db = mongoose.connection.db;
    try {
      await db.collection('images.files').deleteMany({});
      await db.collection('images.chunks').deleteMany({});
      console.log(
        '   ✅ Collections nettoyées (Users, Observations, Comments, Images)'
      );
    } catch (error) {
      console.log('   ⚠️  GridFS collections may not exist yet (first run)');
    }

    // 4. Seed Admin (1 admin)
    const admin = await seedAdmin();

    // 5. Seed Users (10 utilisateurs normaux)
    const users = await seedUsers();
    // 6. Seed Observations (15 observations avec images)
    const observations = await seedObservations(users);

    // 7. Seed Comments (~50 commentaires sur les observations)
    const comments = await seedComments(users, observations);

    // 8. Statistiques finales
    console.log('╔══════════════════════════════════════════════════╗');
    console.log('║            📊 STATISTIQUES FINALES              ║');
    console.log('╚══════════════════════════════════════════════════╝');
    console.log(`   👤 Administrateurs:    ${1}`);
    console.log(`   👥 Utilisateurs:       ${users.length}`);
    console.log(`   📸 Observations:       ${observations.length}`);
    console.log(`   💬 Commentaires:       ${comments.length}`);
    console.log(
      `   🖼️  Images uploadées:   ${
        observations.filter((o) => o.imageUrl).length
      }\n`
    );

    console.log('╔════════════════════════════════════════════════════╗');
    console.log('║           🔑 INFORMATIONS DE CONNEXION            ║');
    console.log('╚════════════════════════════════════════════════════╝');
    console.log('   📧 Email admin:    admin@phenom.app');
    console.log('   🔒 Mot de passe:   Admin123!');
    console.log('   📧 Email users:    sophie.martin@example.com (et autres)');
    console.log('   🔒 Mot de passe:   Password123!\n');

    console.log('✅ Seed terminé avec succès !\n');
  } catch (error) {
    console.error('\n❌ Erreur lors du seed:', error);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
};

// Exécution
seedDatabase();
