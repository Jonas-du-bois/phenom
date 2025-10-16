import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../src/config/database.js';

// Configuration avant tous les tests
beforeAll(async () => {
  // Définir l'environnement de test
  process.env.NODE_ENV = 'test';
  process.env.MONGODB_TEST_URI = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/phenom_test';
  process.env.JWT_SECRET = 'test-secret-key';
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key';

  // Connexion à la base de test
  await connectDB();
});

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
});
