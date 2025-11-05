import User from '../../../src/models/User.js';
import adminData from '../data/admin.data.js';

/**
 * Seed l'administrateur principal
 */
export async function seedAdmin() {
  try {
    console.log('👤 Seed de l\'administrateur...');

    // Vérifier si l'admin existe déjà
    const existingAdmin = await User.findOne({ email: adminData.email });

    if (existingAdmin) {
      console.log('   ⚠️  Admin déjà existant, suppression...');
      await User.deleteOne({ email: adminData.email });
    }

    // Créer l'admin
    const admin = await User.create(adminData);

    console.log(`   ✅ Admin créé: ${admin.name} (${admin.email})`);
    console.log(`   🔑 Mot de passe: ${adminData.password}`);

    return admin;
  } catch (error) {
    console.error('   ❌ Erreur lors du seed admin:', error.message);
    throw error;
  }
}

export default seedAdmin;
