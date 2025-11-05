/**
 * Script pour télécharger des images placeholder pour le seed
 * Utilise Unsplash API pour obtenir des images de qualité
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const IMAGES_DIR = path.join(__dirname, 'images');
const BASE_URL = 'https://picsum.photos';

// Liste des images à télécharger (correspond aux noms dans observations.data.js)
const images = [
  'ovni-triangle-lausanne.jpg',
  'ovni-sphere-geneve.jpg',
  'ovni-formation-berne.jpg',
  'ovni-disque-zurich.jpg',
  'ovni-cylindre-lyon.jpg',
  'ovni-cigare-paris.jpg',
  'ovni-lumiere-marseille.jpg',
  'ovni-boomerang-nice.jpg',
  'ovni-rayon-toulouse.jpg',
  'ovni-sphere2-bordeaux.jpg',
  'ovni-triangle2-strasbourg.jpg',
  'ovni-disque2-lucerne.jpg',
  'ovni-formation2-montreux.jpg',
  'ovni-lumiere2-neuchatel.jpg',
  'ovni-cylindre2-fribourg.jpg'
];

/**
 * Télécharge une image depuis une URL
 */
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    console.log(`📥 Téléchargement: ${path.basename(filepath)}...`);

    const file = fs.createWriteStream(filepath);

    https.get(url, (response) => {
      // Suivre les redirections
      if (response.statusCode === 301 || response.statusCode === 302) {
        return downloadImage(response.headers.location, filepath)
          .then(resolve)
          .catch(reject);
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Status Code: ${response.statusCode}`));
        return;
      }

      response.pipe(file);

      file.on('finish', () => {
        file.close();
        console.log(`   ✅ ${path.basename(filepath)}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {}); // Supprime le fichier partiel
      reject(err);
    });
  });
}

/**
 * Script principal
 */
async function main() {
  console.log('╔════════════════════════════════════════════════════╗');
  console.log('║    🖼️  TÉLÉCHARGEMENT D\'IMAGES PLACEHOLDER       ║');
  console.log('╚════════════════════════════════════════════════════╝\n');

  // Créer le dossier images s'il n'existe pas
  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
    console.log('📁 Dossier images créé\n');
  }

  // Vérifier quelles images manquent
  const missingImages = images.filter(img => {
    const filepath = path.join(IMAGES_DIR, img);
    return !fs.existsSync(filepath);
  });

  if (missingImages.length === 0) {
    console.log('✅ Toutes les images sont déjà présentes !\n');
    return;
  }

  console.log(`📊 ${missingImages.length} images à télécharger\n`);

  // Télécharger chaque image
  for (let i = 0; i < missingImages.length; i++) {
    const filename = missingImages[i];
    const filepath = path.join(IMAGES_DIR, filename);

    // URL avec seed différent pour chaque image (pour avoir des images différentes)
    const imageUrl = `${BASE_URL}/800/600?random=${i}`;

    try {
      await downloadImage(imageUrl, filepath);

      // Attendre un peu entre chaque téléchargement (rate limiting)
      if (i < missingImages.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error(`   ❌ Erreur: ${error.message}`);
      console.log(`   ⚠️  Tu peux télécharger manuellement: ${filename}\n`);
    }
  }

  console.log('\n╔════════════════════════════════════════════════════╗');
  console.log('║              ✅ TÉLÉCHARGEMENT TERMINÉ            ║');
  console.log('╚════════════════════════════════════════════════════╝\n');

  console.log('📝 Note: Ces images sont des placeholders génériques.');
  console.log('   Pour de vraies images OVNI, remplace-les manuellement.\n');

  console.log('🚀 Maintenant, lance le seed:');
  console.log('   npm run seed\n');
}

// Exécution
main().catch(error => {
  console.error('\n❌ Erreur lors du téléchargement:', error.message);
  console.error(error.stack);
  process.exit(1);
});
