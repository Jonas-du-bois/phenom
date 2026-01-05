import {
  uploadImage,
  deleteImage,
  deleteImages,
  getImageUrl,
} from "../config/cloudinary.js";
import imageCompressor from "../utils/compress-image.js";
import OBSERVATION_TYPES from "../constants/observationTypes.js";

/**
 * Image management service with Cloudinary
 * Replaces GridFS for better performance and simplicity
 *
 * Also includes image generation via the Gemini API
 */
class ImageService {
  /**
   * Uploads an image to Cloudinary (with automatic compression)
   */
  async uploadImage(buffer, filename, mimetype, observationId) {
    try {
      const compressed = await imageCompressor.compress(buffer, mimetype);

      const result = await uploadImage(compressed.buffer, {
        folder: "phenom/observations",
        public_id: `${observationId}_${Date.now()}`,
        maxWidth: 1920,
        maxHeight: 1920,
        quality: 85,
      });

      return {
        publicId: result.public_id,
        url: result.secure_url,
        format: result.format,
        size: result.bytes,
        width: result.width,
        height: result.height,
        observationId,
        compression: {
          originalSize: compressed.metadata.originalSize,
          compressedSize: compressed.metadata.compressedSize,
          ratio: compressed.metadata.compressionRatio,
          savedBytes: compressed.metadata.savedBytes,
        },
      };
    } catch (error) {
      throw new Error(`Erreur lors de l'upload: ${error.message}`);
    }
  }

  // =========================================================================
  // AI IMAGE GENERATION (Gemini API)
  // =========================================================================

  /**
   * Builds an optimized prompt for image generation from observation data
   *
   * @param {Object} observationData - Observation data
   * @param {string} observationData.title - Observation title
   * @param {string} observationData.description - Detailed description
   * @param {string} [observationData.type] - Observation type code (WAV, OBS, etc.)
   * @param {string[]} [observationData.tags] - Associated tags
   * @param {Object} [observationData.location] - Geographic coordinates
   * @returns {string} Formatted prompt for Gemini
   */
  buildAiPrompt(observationData) {
    const { title, description, type, tags, location } = observationData;

    // Prompt base - consistent artistic style
    let prompt = `Create a photorealistic, atmospheric illustration of a UFO/paranormal phenomenon observation. 
Style: Cinematic, dramatic lighting, slightly mysterious and eerie mood, night or dusk setting preferred.

`;

    // Add the title as main subject
    prompt += `Main subject: ${title}\n\n`;

    // Add the full description
    prompt += `Detailed description: ${description}\n\n`;

    // Add observation type context if available
    if (type && OBSERVATION_TYPES[type]) {
      const typeInfo = OBSERVATION_TYPES[type];
      prompt += `Phenomenon type: ${typeInfo.label} (${typeInfo.description})\n`;
    }

    // Add tags as additional visual elements
    if (tags && tags.length > 0) {
      prompt += `Additional visual elements: ${tags.join(", ")}\n`;
    }

    // Add generic geographic context if available
    if (location && location.coordinates) {
      prompt += "Setting: Outdoor landscape scene\n";
    }

    // Final instructions for quality
    prompt += `
Important: 
- No text or watermarks in the image
- High quality, detailed rendering
- Mysterious and captivating atmosphere
- Suitable for a scientific/documentary style report`;

    return prompt;
  }

  /**
   * Calls the Gemini API to generate an image
   *
   * @param {string} prompt - The generation prompt
   * @returns {Promise<Buffer>} Buffer of the generated image
   * @throws {Error} If the API fails or is not configured
   */
  async callGeminiApi(prompt) {
    const apiKey = process.env.GEMINI_API_KEY;

    console.log(
      "🔑 GEMINI_API_KEY configurée:",
      apiKey ? `Oui (${apiKey.substring(0, 10)}...)` : "NON!"
    );

    if (!apiKey) {
      throw new Error(
        "GEMINI_API_KEY non configurée dans les variables d'environnement"
      );
    }

    const endpoint =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent";

    console.log("🤖 Appel API Gemini pour génération d'image...");
    console.log("📝 Prompt:", prompt.substring(0, 200) + "...");
    console.log("🌐 Endpoint:", endpoint);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            responseModalities: ["TEXT", "IMAGE"],
          },
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error("❌ Erreur API Gemini:", response.status, errorBody);

        // Specific error handling
        if (response.status === 429) {
          throw new Error(
            "Limite de requêtes Gemini atteinte. Le modèle expérimental a des quotas très limités. Réessayez dans quelques minutes."
          );
        }
        if (response.status === 403) {
          throw new Error(
            "Accès refusé à l'API Gemini. Vérifiez que la clé API est valide et que le modèle est accessible."
          );
        }
        if (response.status === 400) {
          throw new Error(
            "Requête invalide vers Gemini. Le prompt ou la configuration peut être incorrecte."
          );
        }

        throw new Error(`Erreur API Gemini: ${response.status} - ${errorBody}`);
      }

      const data = await response.json();

      // Extract base64 image from response
      const candidates = data.candidates;
      if (!candidates || candidates.length === 0) {
        throw new Error("Aucun candidat dans la réponse Gemini");
      }

      const parts = candidates[0].content?.parts;
      if (!parts || parts.length === 0) {
        throw new Error("Aucune partie dans la réponse Gemini");
      }

      // Find the part containing the image
      const imagePart = parts.find((part) => part.inlineData?.data);
      if (!imagePart) {
        throw new Error("Aucune image dans la réponse Gemini");
      }

      const base64Data = imagePart.inlineData.data;
      const mimeType = imagePart.inlineData.mimeType || "image/png";

      console.log("✅ Image générée avec succès, mime:", mimeType);

      // Convert base64 to Buffer
      const buffer = Buffer.from(base64Data, "base64");

      return { buffer, mimeType };
    } catch (error) {
      console.error("❌ Erreur lors de l'appel API Gemini:", error.message);
      throw error;
    }
  }

  /**
   * Generates an AI image for an observation and uploads it to Cloudinary
   *
   * @param {Object} observationData - Observation data to build the prompt
   * @param {string} observationId - MongoDB observation ID
   * @returns {Promise<Object>} Image object with source: 'ai'
   * @throws {Error} If generation or upload fails
   */
  async generateAiImage(observationData, observationId) {
    console.log(
      `🎨 Génération d'image IA pour l'observation ${observationId}...`
    );

    try {
      // 1. Build the prompt
      const prompt = this.buildAiPrompt(observationData);

      // 2. Call the Gemini API
      const { buffer, mimeType } = await this.callGeminiApi(prompt);

      // 3. Upload to Cloudinary (with compression)
      const compressed = await imageCompressor.compress(buffer, mimeType);

      const result = await uploadImage(compressed.buffer, {
        folder: "phenom/observations/ai-generated",
        public_id: `ai_${observationId}_${Date.now()}`,
        maxWidth: 1920,
        maxHeight: 1920,
        quality: 85,
      });

      console.log(`✅ Image IA uploadée sur Cloudinary: ${result.secure_url}`);

      // 4. Return the image object with source: 'ai'
      return {
        publicId: result.public_id,
        url: result.secure_url,
        format: result.format,
        size: result.bytes,
        width: result.width,
        height: result.height,
        uploadedAt: new Date(),
        source: "ai",
      };
    } catch (error) {
      console.error(
        `❌ Échec génération image IA pour ${observationId}:`,
        error.message
      );
      throw new Error(`Échec génération image IA: ${error.message}`);
    }
  }

  /**
   * Deletes an image from Cloudinary
   */
  async deleteImage(publicId) {
    try {
      const result = await deleteImage(publicId);

      if (result.result !== "ok" && result.result !== "not found") {
        throw new Error("IMAGE_DELETE_FAILED");
      }
    } catch (error) {
      if (error.message === "IMAGE_DELETE_FAILED") {
        throw error;
      }
      throw new Error(`Erreur lors de la suppression: ${error.message}`);
    }
  }

  /**
   * Deletes multiple images
   */
  async deleteMultipleImages(publicIds) {
    try {
      if (!publicIds || publicIds.length === 0) {
        return 0;
      }

      const result = await deleteImages(publicIds);
      return result.deleted ? Object.keys(result.deleted).length : 0;
    } catch (error) {
      throw new Error(
        `Erreur lors de la suppression multiple: ${error.message}`
      );
    }
  }

  /**
   * Deletes all images for an observation (cascade)
   */
  async deleteAllImagesForObservation(observationId) {
    try {
      const Observation = (await import("../models/Observation.js")).default;
      const observation = await Observation.findById(observationId);

      if (
        !observation ||
        !observation.images ||
        observation.images.length === 0
      ) {
        return 0;
      }

      const publicIds = observation.images.map((img) => img.publicId);
      return await this.deleteMultipleImages(publicIds);
    } catch (error) {
      console.error(
        `Erreur lors de la suppression des images de l'observation ${observationId}:`,
        error
      );
      return 0;
    }
  }

  /**
   * Generates an optimized URL
   */
  getImageUrl(publicId, options = {}) {
    return getImageUrl(publicId, options);
  }
}

export default new ImageService();
