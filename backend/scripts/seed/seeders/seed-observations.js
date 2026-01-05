import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Observation from "../../../src/models/Observation.js";
import imageService from "../../../src/services/image.service.js";
import observationsData from "../data/observations.data.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Seeds observations with their images
 */
export async function seedObservations(users) {
  try {
    console.log("\n📸 Seed des observations...");

    const createdObservations = [];
    const imagesDir = path.join(__dirname, "../images");

    for (let i = 0; i < observationsData.length; i++) {
      const obsData = observationsData[i];
      const user = users[obsData.userIndex];

      if (!user) {
        console.log(
          `   ⚠️  Utilisateur ${obsData.userIndex} introuvable, skip observation ${i}`
        );
        continue;
      }

      // Create the observation with all model fields
      const observation = await Observation.create({
        date: obsData.date,
        time: obsData.time,
        location: obsData.location,
        country: obsData.country,
        state: obsData.state,
        description: obsData.description,
        credibility: obsData.credibility || 5,
        strangeness: obsData.strangeness || 5,
        duration: obsData.duration || 0,
        locale: obsData.locale || "Unknown",
        coordinates: obsData.coordinates,
        observerTypes: obsData.observerTypes || [],
        ufoShapes: obsData.ufoShapes || [],
        phenomena: obsData.phenomena || [],
        userId: user._id,
        tags: obsData.tags || [],
        source: "seed",
      });

      // Upload image if it exists
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

          // Add image with the new Cloudinary structure
          observation.images.push({
            publicId: imageInfo.publicId,
            url: imageInfo.url,
            size: imageInfo.size,
            format: imageInfo.format,
            width: imageInfo.width,
            height: imageInfo.height,
            uploadedAt: new Date(),
          });
          await observation.save();

          console.log(
            `   ✅ [${i + 1}/${
              observationsData.length
            }] ${observation.location.substring(
              0,
              30
            )}... (${observation.phenomena.join(", ")}) (avec image Cloudinary)`
          );
        } catch (imageError) {
          console.log(
            `   ⚠️  [${i + 1}/${
              observationsData.length
            }] ${observation.location.substring(0, 30)}... (sans image: ${
              imageError.message
            })`
          );
        }
      } else {
        console.log(
          `   ℹ️  [${i + 1}/${
            observationsData.length
          }] ${observation.location.substring(
            0,
            30
          )}... (image placeholder manquante)`
        );
      }

      createdObservations.push(observation);
    }

    console.log(
      `   📊 Total: ${createdObservations.length} observations créées`
    );

    return createdObservations;
  } catch (error) {
    console.error("   ❌ Erreur lors du seed observations:", error.message);
    throw error;
  }
}

/**
 * Determines the MIME type from the file extension
 */
function getMimeType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
  };
  return mimeTypes[ext] || "image/jpeg";
}

export default seedObservations;
