import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { connectDB, disconnectDB } from '../src/config/database.js';
import User from '../src/models/User.js';
import Observation from '../src/models/Observation.js';
import Comment from '../src/models/Comment.js';

// Charger les variables d'environnement depuis la RACINE
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

/**
 * Script pour peupler la base de données avec des données de test
 */
const seedDatabase = async () => {
  try {
    await connectDB();

    // Nettoyer les collections existantes
    console.log('🧹 Nettoyage des collections...');
    await Promise.all([
      User.deleteMany({}),
      Observation.deleteMany({}),
      Comment.deleteMany({})
    ]);

    // Créer des utilisateurs
    console.log('👥 Création des utilisateurs...');
    const users = await User.create([
      {
        name: 'Admin Phenom',
        email: 'admin@phenom.com',
        password: 'Admin123!',
        role: 'admin'
      },
      {
        name: 'Jean Dupont',
        email: 'jean.dupont@example.com',
        password: 'password123',
        role: 'viewer'
      },
      {
        name: 'Marie Martin',
        email: 'marie.martin@example.com',
        password: 'password123',
        role: 'viewer'
      },
      {
        name: 'Pierre Durand',
        email: 'pierre.durand@example.com',
        password: 'password123',
        role: 'viewer'
      }
    ]);

    console.log(`✅ ${users.length} utilisateurs créés`);

    // Créer des observations
    console.log('🛸 Création des observations...');
    const observations = await Observation.create([
      {
        title: 'Lumière étrange dans le ciel nocturne',
        description: 'Une lumière brillante et pulsante observée pendant environ 5 minutes. L\'objet se déplaçait de manière erratique, changeant de direction brusquement.',
        location: {
          type: 'Point',
          coordinates: [6.6323, 46.5197] // Lausanne
        },
        userId: users[1]._id,
        imageUrl: 'https://picsum.photos/800/600?random=1'
      },
      {
        title: 'Formation triangulaire au-dessus du lac',
        description: 'Trois lumières formant un triangle parfait, se déplaçant lentement au-dessus du Léman. Observation silencieuse.',
        location: {
          type: 'Point',
          coordinates: [6.1432, 46.2044] // Genève
        },
        userId: users[2]._id,
        imageUrl: 'https://picsum.photos/800/600?random=2'
      },
      {
        title: 'Disque lumineux tournant sur lui-même',
        description: 'Un objet en forme de disque, émettant une lumière orangée, tournant rapidement. Observé pendant 10 minutes avant de disparaître.',
        location: {
          type: 'Point',
          coordinates: [7.4474, 46.9479] // Berne
        },
        userId: users[1]._id,
        imageUrl: 'https://picsum.photos/800/600?random=3'
      },
      {
        title: 'Objet cylindrique volant à basse altitude',
        description: 'Un objet de forme cylindrique, métallique, volant à environ 200m d\'altitude. Pas de bruit, vitesse constante.',
        location: {
          type: 'Point',
          coordinates: [8.5417, 47.3769] // Zurich
        },
        userId: users[3]._id,
        imageUrl: 'https://picsum.photos/800/600?random=4'
      },
      {
        title: 'Multiple objets en formation',
        description: 'Plusieurs objets lumineux se déplaçant en formation synchronisée. Changements de couleur du blanc au rouge.',
        location: {
          type: 'Point',
          coordinates: [7.5886, 47.5596] // Bâle
        },
        userId: users[2]._id,
        imageUrl: 'https://picsum.photos/800/600?random=5'
      },
      {
        title: 'Sphère lumineuse stationnaire',
        description: 'Une sphère brillante restée immobile pendant 30 minutes avant de s\'élever verticalement à grande vitesse.',
        location: {
          type: 'Point',
          coordinates: [9.0376, 47.5050] // St-Gall
        },
        userId: users[1]._id,
        imageUrl: 'https://picsum.photos/800/600?random=6'
      }
    ]);

    console.log(`✅ ${observations.length} observations créées`);

    // Créer des commentaires
    console.log('💬 Création des commentaires...');
    const comments = await Comment.create([
      {
        text: 'Incroyable! J\'ai vu la même chose le même soir!',
        observationId: observations[0]._id,
        userId: users[2]._id
      },
      {
        text: 'Avez-vous contacté les autorités?',
        observationId: observations[0]._id,
        userId: users[3]._id
      },
      {
        text: 'C\'est fascinant. Quelle heure était-il exactement?',
        observationId: observations[1]._id,
        userId: users[1]._id
      },
      {
        text: 'J\'ai entendu parler d\'observations similaires dans la région.',
        observationId: observations[2]._id,
        userId: users[2]._id
      },
      {
        text: 'Photo impressionnante! Merci pour le partage.',
        observationId: observations[3]._id,
        userId: users[1]._id
      },
      {
        text: 'Est-ce que quelqu\'un d\'autre a vu cela?',
        observationId: observations[4]._id,
        userId: users[3]._id
      }
    ]);

    console.log(`✅ ${comments.length} commentaires créés`);

    console.log('\n' + '='.repeat(50));
    console.log('✅ Base de données peuplée avec succès!');
    console.log('='.repeat(50));
    console.log('\n📊 Statistiques:');
    console.log(`   👥 Utilisateurs: ${users.length}`);
    console.log(`   🛸 Observations: ${observations.length}`);
    console.log(`   💬 Commentaires: ${comments.length}`);
    console.log('\n🔑 Compte admin:');
    console.log(`   📧 Email: admin@phenom.com`);
    console.log(`   🔐 Mot de passe: Admin123!`);
    console.log('\n👤 Comptes utilisateurs:');
    console.log(`   📧 jean.dupont@example.com / password123`);
    console.log(`   📧 marie.martin@example.com / password123`);
    console.log(`   📧 pierre.durand@example.com / password123`);
    console.log('='.repeat(50));

    await disconnectDB();
    process.exit(0);

  } catch (error) {
    console.error('❌ Erreur lors du peuplement:', error.message);
    await disconnectDB();
    process.exit(1);
  }
};

seedDatabase();
