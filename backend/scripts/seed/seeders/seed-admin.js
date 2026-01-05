import User from "../../../src/models/User.js";
import adminData from "../data/admin.data.js";

/**
 * Seeds the main administrator account
 */
export async function seedAdmin() {
  try {
    console.log("👤 Seed de l'administrateur...");

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminData.email });

    if (existingAdmin) {
      console.log("   ⚠️  Admin déjà existant, suppression...");
      await User.deleteOne({ email: adminData.email });
    }

    // Create the admin user
    const admin = await User.create(adminData);

    console.log(`   ✅ Admin créé: ${admin.name} (${admin.email})`);
    console.log(`   🔑 Mot de passe: ${adminData.password}`);

    return admin;
  } catch (error) {
    console.error("   ❌ Erreur lors du seed admin:", error.message);
    throw error;
  }
}

export default seedAdmin;
