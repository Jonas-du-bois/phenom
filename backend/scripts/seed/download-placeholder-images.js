/**
 * Script to download placeholder images for seeding
 * Uses Picsum API to obtain quality images
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import https from "https";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const IMAGES_DIR = path.join(__dirname, "images");
const BASE_URL = "https://picsum.photos";

// List of images to download (matches filenames in observations.data.js)
const images = [
  // Observations 0-9
  "ovni-triangle-lausanne.jpg",
  "ovni-sphere-geneve.jpg",
  "ovni-formation-berne.jpg",
  "ovni-disque-zurich.jpg",
  "ovni-submersible-leman.jpg",
  "ovni-rayon-lyon.jpg",
  "ovni-cigare-paris.jpg",
  "ovni-signaux-marseille.jpg",
  "ovni-atterrissage-alpes.jpg",
  "ovni-panne-toulouse.jpg",
  // Observations 10-19
  "ovni-animaux-bordeaux.jpg",
  "ovni-enlevement-strasbourg.jpg",
  "ovni-traces-lucerne.jpg",
  "ovni-radiation-montreux.jpg",
  "ovni-entite-neuchatel.jpg",
  "ovni-historique-fribourg.jpg",
  "ovni-camouflage-nice.jpg",
  "satellites-starlink-lille.jpg",
  "ovni-contact-grenoble.jpg",
  "ovni-humanoide-nantes.jpg",
  // Observations 20-29
  "ovni-coverup-dijon.jpg",
  "ovni-rapport-annecy.jpg",
  "traces-vosges.jpg",
  "cercle-colmar.jpg",
  "panne-montpellier.jpg",
  "brulures-vaud.jpg",
  "nocturne-jura.jpg",
  "triangle-besancon.jpg",
  "sphere-couleurs-geneve.jpg",
  "duo-bale.jpg",
  // Observations 30-39
  "nuage-lausanne.jpg",
  "telescope-clermont.jpg",
  "rayons-fontainebleau.jpg",
  "atterrissage-thonon.jpg",
  "missing-time-mulhouse.jpg",
  "submersible-neuchatel.jpg",
  "sons-chamonix.jpg",
  "oiseaux-camargue.jpg",
  "interference-reims.jpg",
  "fragment-perpignan.jpg",
  // Observations 40-44
  "arbres-nancy.jpg",
  "radiation-grenoble.jpg",
  "pylone-metz.jpg",
  "effets-brest.jpg",
  "contact-rennes.jpg",
];

/**
 * Downloads an image from a URL
 */
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    console.log(`📥 Téléchargement: ${path.basename(filepath)}...`);

    const file = fs.createWriteStream(filepath);

    https
      .get(url, (response) => {
        // Follow redirects
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

        file.on("finish", () => {
          file.close();
          console.log(`   ✅ ${path.basename(filepath)}`);
          resolve();
        });
      })
      .on("error", (err) => {
        fs.unlink(filepath, () => {}); // Delete partial file
        reject(err);
      });
  });
}

/**
 * Main script
 */
async function main() {
  console.log("╔════════════════════════════════════════════════════╗");
  console.log("║    🖼️  TÉLÉCHARGEMENT D'IMAGES PLACEHOLDER       ║");
  console.log("╚════════════════════════════════════════════════════╝\n");

  // Create images folder if it doesn't exist
  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
    console.log("📁 Dossier images créé\n");
  }

  // Check which images are missing
  const missingImages = images.filter((img) => {
    const filepath = path.join(IMAGES_DIR, img);
    return !fs.existsSync(filepath);
  });

  if (missingImages.length === 0) {
    console.log("✅ Toutes les images sont déjà présentes !\n");
    return;
  }

  console.log(`📊 ${missingImages.length} images à télécharger\n`);

  // Download each image
  for (let i = 0; i < missingImages.length; i++) {
    const filename = missingImages[i];
    const filepath = path.join(IMAGES_DIR, filename);

    // URL with different seed for each image (to get different images)
    const imageUrl = `${BASE_URL}/1200/1000?random=${i}`;

    try {
      await downloadImage(imageUrl, filepath);

      // Wait a bit between downloads (rate limiting)
      if (i < missingImages.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error(`   ❌ Erreur: ${error.message}`);
      console.log(`   ⚠️  Tu peux télécharger manuellement: ${filename}\n`);
    }
  }

  console.log("\n╔════════════════════════════════════════════════════╗");
  console.log("║              ✅ TÉLÉCHARGEMENT TERMINÉ            ║");
  console.log("╚════════════════════════════════════════════════════╝\n");

  console.log("📝 Note: Ces images sont des placeholders génériques.");
  console.log("   Pour de vraies images OVNI, remplace-les manuellement.\n");

  console.log("🚀 Maintenant, lance le seed:");
  console.log("   npm run seed\n");
}

// Execution
main().catch((error) => {
  console.error("\n❌ Erreur lors du téléchargement:", error.message);
  console.error(error.stack);
  process.exit(1);
});
