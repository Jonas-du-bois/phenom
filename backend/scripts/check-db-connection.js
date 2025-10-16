import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Charger les variables d'environnement depuis la RACINE
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

/**
 * Script de diagnostic pour vérifier la connexion MongoDB
 * Utilise: node scripts/check-db-connection.js
 */
const checkConnection = async () => {
  console.log('='.repeat(60));
  console.log('🔍 Diagnostic de connexion MongoDB');
  console.log('='.repeat(60));
  
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.error('❌ MONGODB_URI n\'est pas défini dans .env');
    process.exit(1);
  }

  // Masquer le mot de passe dans l'affichage
  const maskedUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
  console.log(`📍 URI: ${maskedUri}`);
  
  // Détection du type de connexion
  const isAtlas = uri.includes('mongodb+srv://');
  const isLocal = uri.includes('localhost') || uri.includes('127.0.0.1');
  
  console.log(`📦 Type: ${isAtlas ? 'MongoDB Atlas (Cloud)' : isLocal ? 'MongoDB Local' : 'MongoDB Distant'}`);
  console.log(`🌍 Environnement: ${process.env.NODE_ENV || 'development'}`);
  console.log('');
  
  try {
    console.log('⏳ Tentative de connexion...');
    
    const options = {
      maxPoolSize: 10,
      minPoolSize: 5,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 10000,
      ...(isAtlas ? {} : { family: 4 })
    };

    await mongoose.connect(uri, options);
    
    console.log('✅ Connexion réussie !');
    console.log('');
    console.log('📊 Informations de connexion:');
    console.log(`   Host: ${mongoose.connection.host}`);
    console.log(`   Port: ${mongoose.connection.port || 'N/A (SRV)'}`);
    console.log(`   Database: ${mongoose.connection.name}`);
    console.log(`   État: ${mongoose.connection.readyState === 1 ? 'Connecté' : 'Déconnecté'}`);
    console.log('');

    // Liste des collections
    console.log('📚 Collections disponibles:');
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    if (collections.length === 0) {
      console.log('   ⚠️  Aucune collection (base de données vide)');
    } else {
      for (const collection of collections) {
        const count = await mongoose.connection.db.collection(collection.name).countDocuments();
        console.log(`   - ${collection.name}: ${count} document(s)`);
      }
    }
    
    console.log('');
    console.log('✅ Diagnostic terminé avec succès');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('');
    console.error('❌ Échec de la connexion');
    console.error('='.repeat(60));
    console.error('Erreur:', error.message);
    console.error('');
    
    if (error.message.includes('Authentication failed')) {
      console.error('💡 Vérifiez:');
      console.error('   - Le nom d\'utilisateur et mot de passe dans MONGODB_URI');
      console.error('   - Les privilèges de l\'utilisateur dans MongoDB Atlas');
    } else if (error.message.includes('ECONNREFUSED') || error.message.includes('connect')) {
      console.error('💡 Vérifiez:');
      console.error('   - Que MongoDB est démarré (si local)');
      console.error('   - Network Access dans Atlas (si cloud)');
      console.error('   - Votre connexion internet');
      console.error('   - Les paramètres firewall');
    } else if (error.message.includes('querySrv ENOTFOUND')) {
      console.error('💡 Vérifiez:');
      console.error('   - L\'URL du cluster Atlas');
      console.error('   - Votre connexion DNS');
    }
    
    console.error('='.repeat(60));
    process.exit(1);
    
  } finally {
    await mongoose.connection.close();
  }
};

checkConnection();
