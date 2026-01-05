import mongoose from "mongoose";
import { connectDB, disconnectDB } from "../src/config/database.js";

// Cleanup before all tests in a file
beforeAll(async () => {
  // Disconnect if already connected
  if (mongoose.connection.readyState !== 0) {
    console.log(
      `⚠️  Mongoose déjà connecté (state: ${mongoose.connection.readyState}), déconnexion...`
    );
    await mongoose.disconnect();
  }

  // Set test environment
  process.env.NODE_ENV = "test";
  // Use MONGODB_TEST_URI for tests (priority if defined, otherwise fallback to MONGODB_URI)
  if (!process.env.MONGODB_TEST_URI && process.env.MONGODB_URI) {
    process.env.MONGODB_TEST_URI = process.env.MONGODB_URI;
    console.log("✓ MONGODB_TEST_URI défini depuis MONGODB_URI");
  }
  if (!process.env.MONGODB_TEST_URI) {
    process.env.MONGODB_TEST_URI = "mongodb://localhost:27017/phenom_test";
    console.log("✓ MONGODB_TEST_URI défini par défaut (local)");
  }
  process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret-key";
  process.env.JWT_REFRESH_SECRET =
    process.env.JWT_REFRESH_SECRET || "test-refresh-secret-key";

  console.log("🔌 Connexion à MongoDB pour les tests...");
  // Connect to test database
  await connectDB();
  console.log(
    `✅ Tests connectés à MongoDB (state: ${mongoose.connection.readyState})`
  );

  // Initial cleanup
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
}, 30000); // 30s timeout for MongoDB Atlas connection

// Cleanup before each test (safer than afterEach)
beforeEach(async () => {
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// Cleanup after all tests
afterAll(async () => {
  await disconnectDB();
}, 30000); // 30s timeout for disconnection
