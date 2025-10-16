import mongoose from 'mongoose';

/**
 * Configure et connecte à MongoDB (local ou Atlas)
 * Charge automatiquement les variables depuis phenom/.env
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  try {
    const uri = process.env.NODE_ENV === 'test' 
      ? process.env.MONGODB_TEST_URI 
      : process.env.MONGODB_URI;

    if (!uri) {
      throw new Error('MONGODB_URI non défini dans .env');
    }

    // Détection si Atlas ou local
    const isAtlas = uri.includes('mongodb+srv://');

    // Désactiver autoIndex en production (performances + sécurité)
    mongoose.set('autoIndex', process.env.NODE_ENV !== 'production');

    const options = {
      maxPoolSize: 10,
      minPoolSize: 5,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 10000,
      // Ne pas forcer IPv4 pour Atlas (supporte IPv6)
      ...(isAtlas ? {} : { family: 4 })
    };

    await mongoose.connect(uri, options);

    const connectionType = isAtlas ? 'MongoDB Atlas (Cloud)' : `MongoDB Local (${mongoose.connection.host})`;
    console.log(`✅ ${connectionType} connecté avec succès`);
    console.log(`   Database: ${mongoose.connection.name}`);
    console.log(`   AutoIndex: ${mongoose.get('autoIndex') ? 'activé (dev)' : 'désactivé (prod)'}`);

    // Gestion des événements de connexion
    mongoose.connection.on('error', (err) => {
      console.error('❌ Erreur MongoDB:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB déconnecté');
    });

    // Gestion de la fermeture propre
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🔌 Connexion MongoDB fermée (SIGINT)');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Erreur de connexion MongoDB:', error.message);
    process.exit(1);
  }
};

/**
 * Ferme la connexion à MongoDB
 * @returns {Promise<void>}
 */
const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('🔌 Connexion MongoDB fermée');
  } catch (error) {
    console.error('❌ Erreur lors de la fermeture:', error.message);
    throw error;
  }
};

export { connectDB, disconnectDB };
