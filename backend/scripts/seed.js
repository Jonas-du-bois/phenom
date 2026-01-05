import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { connectDB, disconnectDB } from "../src/config/database.js";
import User from "../src/models/User.js";
import Observation from "../src/models/Observation.js";
import Comment from "../src/models/Comment.js";

// Import modular seeders
import seedAdmin from "./seed/seeders/seed-admin.js";
import seedUsers from "./seed/seeders/seed-users.js";
import seedObservations from "./seed/seeders/seed-observations.js";
import seedComments from "./seed/seeders/seed-comments.js";

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, "../../.env"); // Project root (phenom/.env)
dotenv.config({ path: envPath });

/**
 * Main script to populate the MongoDB Atlas database
 * Modular architecture with separation of concerns
 */
const seedDatabase = async () => {
  try {
    console.log("╔════════════════════════════════════════════════════╗");
    console.log("║     SEED DE LA BASE DE DONNÉES PHENOM              ║");
    console.log("╚════════════════════════════════════════════════════╝\n");

    // Step 1: Connect to MongoDB Atlas
    console.log("🔌 Connexion à MongoDB Atlas...");
    await connectDB();

    // Step 2: Clean existing collections
    console.log("\n🧹 Nettoyage des collections...");
    await Promise.all([
      User.deleteMany({}),
      Observation.deleteMany({}),
      Comment.deleteMany({}),
    ]);
    console.log("   ✅ Collections nettoyées (Users, Observations, Comments)");
    console.log("   📸 Images: Cloudinary (pas de nettoyage nécessaire)");

    // Step 3: Seed Admin (1 admin)
    const _admin = await seedAdmin();

    // Step 4: Seed Users (10 regular users)
    const users = await seedUsers();
    // Step 5: Seed Observations (15 observations with images)
    const observations = await seedObservations(users);

    // Step 6: Seed Comments (~50 comments on observations)
    const comments = await seedComments(users, observations);

    // Step 7: Final statistics
    console.log("╔══════════════════════════════════════════════════╗");
    console.log("║            📊 STATISTIQUES FINALES              ║");
    console.log("╚══════════════════════════════════════════════════╝");
    console.log(`   👤 Administrateurs:    ${1}`);
    console.log(`   👥 Utilisateurs:       ${users.length}`);
    console.log(`   📸 Observations:       ${observations.length}`);
    console.log(`   💬 Commentaires:       ${comments.length}`);
    console.log(
      `   🖼️  Images uploadées:   ${
        observations.filter((o) => o.imageUrl).length
      }\n`
    );

    console.log("╔════════════════════════════════════════════════════╗");
    console.log("║           🔑 INFORMATIONS DE CONNEXION            ║");
    console.log("╚════════════════════════════════════════════════════╝");
    console.log("   📧 Email admin:    admin@phenom.app");
    console.log("   🔒 Mot de passe:   Admin123!");
    console.log("   📧 Email users:    sophie.martin@example.com (et autres)");
    console.log("   🔒 Mot de passe:   Password123!\n");

    console.log("✅ Seed terminé avec succès !\n");
  } catch (error) {
    console.error("\n❌ Erreur lors du seed:", error);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
};

// Execution
seedDatabase();
