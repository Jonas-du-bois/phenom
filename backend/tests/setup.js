import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../src/config/database.js';

// Configuration avant tous les tests
beforeAll(async () => {
  // Déconnecter si déjà connecté
  if (mongoose.connection.readyState !== 0) {
    console.log(`⚠️  Mongoose déjà connecté (state: ${mongoose.connection.readyState}), déconnexion...`);
    await mongoose.disconnect();
  }

  // Définir l'environnement de test
  process.env.NODE_ENV = 'test';
  // Utiliser MONGODB_TEST_URI pour les tests (prioritaire si défini, sinon fallback sur MONGODB_URI)
  if (!process.env.MONGODB_TEST_URI && process.env.MONGODB_URI) {
    process.env.MONGODB_TEST_URI = process.env.MONGODB_URI;
    console.log('✓ MONGODB_TEST_URI défini depuis MONGODB_URI');
  }
  if (!process.env.MONGODB_TEST_URI) {
    process.env.MONGODB_TEST_URI = 'mongodb://localhost:27017/phenom_test';
    console.log('✓ MONGODB_TEST_URI défini par défaut (local)');
  }
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key';
  process.env.JWT_REFRESH_SECRET =
    process.env.JWT_REFRESH_SECRET || 'test-refresh-secret-key';

  console.log('🔌 Connexion à MongoDB pour les tests...');
  // Connexion à la base de test
  await connectDB();
  console.log(`✅ Tests connectés à MongoDB (state: ${mongoose.connection.readyState})`);
}, 30000); // Timeout de 30s pour la connexion MongoDB Atlas

// Nettoyage après chaque test
afterEach(async () => {
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// Nettoyage après tous les tests
afterAll(async () => {
  await disconnectDB();
}, 30000); // Timeout de 30s pour la déconnexion
