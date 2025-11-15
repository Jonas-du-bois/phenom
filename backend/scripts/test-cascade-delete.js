import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { connectDB, disconnectDB } from '../src/config/database.js';
import observationService from '../src/services/observation.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

/**
 * Script pour tester la suppression en cascade
 */
const testCascadeDelete = async () => {
  try {
    await connectDB();

    const Observation = (await import('../src/models/Observation.js')).default;
    const Comment = (await import('../src/models/Comment.js')).default;

    // Trouver une observation avec des images et des commentaires
    const observation = await Observation.findOne({
      'images.0': { $exists: true }
    });

    if (!observation) {
      console.log('❌ Aucune observation avec images trouvée pour tester');
      await disconnectDB();
      return;
    }

    const observationId = observation._id;
    console.log('\n📊 Observation à supprimer:');
    console.log(`  ID: ${observationId}`);
    console.log(`  Titre: ${observation.title}`);
    console.log(`  Images: ${observation.images.length}`);

    // Compter les commentaires
    const commentCount = await Comment.countDocuments({ observationId });
    console.log(`  Commentaires: ${commentCount}`);

    console.log('\n⚠️  ATTENTION: Cette action va supprimer:');
    console.log('  - 1 observation');
    console.log(`  - ${observation.images.length} image(s) sur Cloudinary`);
    console.log(`  - ${commentCount} commentaire(s)`);

    console.log('\n🗑️  Suppression en cours...\n');

    // Supprimer l'observation (doit déclencher la cascade)
    await observationService.deleteObservation(observationId);

    // Vérifier que tout a été supprimé
    const obsCheck = await Observation.findById(observationId);
    const commentsCheck = await Comment.countDocuments({ observationId });

    console.log('\n✅ Vérification après suppression:');
    console.log(`  Observation existe: ${!!obsCheck}`);
    console.log(`  Commentaires restants: ${commentsCheck}`);

    if (!obsCheck && commentsCheck === 0) {
      console.log('\n🎉 SUCCÈS: Suppression en cascade fonctionne correctement!');
    } else {
      console.log('\n❌ ERREUR: La suppression en cascade a échoué');
    }

    await disconnectDB();
  } catch (error) {
    console.error('❌ Erreur:', error);
    await disconnectDB();
    process.exit(1);
  }
};

testCascadeDelete();
