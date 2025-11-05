import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Observation from '../../../src/models/Observation.js';
import imageService from '../../../src/services/image.service.js';
import observationsData from '../data/observations.data.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Seed les observations avec leurs images
 */
export async function seedObservations(users) {
  try {
    console.log('\n📸 Seed des observations...');

    const createdObservations = [];
    const imagesDir = path.join(__dirname, '../images');

    for (let i = 0; i < observationsData.length; i++) {
      const obsData = observationsData[i];
      const user = users[obsData.userIndex];

      if (!user) {
        console.log(`   ⚠️  Utilisateur ${obsData.userIndex} introuvable, skip observation ${i}`);
        continue;
      }

      // Créer l'observation
      const observation = await Observation.create({
        title: obsData.title,
        description: obsData.description,
        location: obsData.location,
        userId: user._id
      });

      // Uploader l'image si elle existe
      const imagePath = path.join(imagesDir, obsData.imageFilename);

      if (fs.existsSync(imagePath)) {
        try {
          const imageBuffer = fs.readFileSync(imagePath);
          const mimetype = getMimeType(obsData.imageFilename);

          const imageInfo = await imageService.uploadImage(
            imageBuffer,
            obsData.imageFilename,
            mimetype,
            observation._id.toString()
          );

          // Ajouter l'image au nouveau système images array
          observation.images.push({
            imageId: imageInfo.id,
            imageUrl: imageInfo.url,
            size: imageInfo.size,
            format: imageInfo.contentType,
            uploadedAt: new Date()
          });
          await observation.save();

          console.log(`   ✅ [${i + 1}/${observationsData.length}] ${observation.title.substring(0, 50)}... (avec image)`);
        } catch (imageError) {
          console.log(`   ⚠️  [${i + 1}/${observationsData.length}] ${observation.title.substring(0, 50)}... (sans image: ${imageError.message})`);
        }
      } else {
        console.log(`   ℹ️  [${i + 1}/${observationsData.length}] ${observation.title.substring(0, 50)}... (image placeholder manquante)`);
      }

      createdObservations.push(observation);
    }

    console.log(`   📊 Total: ${createdObservations.length} observations créées`);

    return createdObservations;
  } catch (error) {
    console.error('   ❌ Erreur lors du seed observations:', error.message);
    throw error;
  }
}

/**
 * Détermine le type MIME à partir de l'extension
 */
function getMimeType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp'
  };
  return mimeTypes[ext] || 'image/jpeg';
}

export default seedObservations;
