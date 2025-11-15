import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import User from '../src/models/User.js';
import { connectDB, disconnectDB } from '../src/config/database.js';

// Charger les variables d'environnement depuis la RACINE
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

/**
 * Script pour créer un utilisateur administrateur par défaut
 */
const createAdmin = async () => {
  try {
    await connectDB();

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@phenom.app';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';
    const adminName = process.env.ADMIN_NAME || 'Administrator';

    // Vérifier si l'admin existe déjà
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log('⚠️  Un administrateur existe déjà avec cet email');
      console.log(`📧 Email: ${existingAdmin.email}`);
      console.log(`👤 Nom: ${existingAdmin.name}`);
      process.exit(0);
    }

    // Créer l'administrateur
    const admin = await User.create({
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      role: 'admin'
    });

    console.log('✅ Administrateur créé avec succès!');
    console.log('='.repeat(50));
    console.log(`📧 Email: ${admin.email}`);
    console.log(`👤 Nom: ${admin.name}`);
    console.log(`🔑 Rôle: ${admin.role}`);
    console.log('='.repeat(50));
    console.log('⚠️  Conservez ces informations en lieu sûr!');

    await disconnectDB();
    process.exit(0);

  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'administrateur:', error.message);
    process.exit(1);
  }
};

createAdmin();
