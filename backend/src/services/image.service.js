import { uploadImage, deleteImage, deleteImages, getImageUrl } from '../config/cloudinary.js';
import imageCompressor from '../utils/compress-image.js';
import OBSERVATION_TYPES from '../constants/observationTypes.js';

/**
 * Service de gestion des images avec Cloudinary
 * Remplace GridFS pour plus de performance et simplicité
 *
 * Inclut également la génération d'images via l'API Gemini
 */
class ImageService {
  /**
   * Upload une image sur Cloudinary (avec compression automatique)
   */
  async uploadImage(buffer, filename, mimetype, observationId) {
    try {
      const compressed = await imageCompressor.compress(buffer, mimetype);

      const result = await uploadImage(compressed.buffer, {
        folder: 'phenom/observations',
        public_id: `${observationId}_${Date.now()}`,
        maxWidth: 1920,
        maxHeight: 1920,
        quality: 85
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
          savedBytes: compressed.metadata.savedBytes
        }
      };
    } catch (error) {
      throw new Error(`Erreur lors de l'upload: ${error.message}`);
    }
  }

  // =========================================================================
  // AI IMAGE GENERATION (Gemini API)
  // =========================================================================

  /**
   * Construit un prompt optimisé pour la génération d'image à partir des données d'observation
   *
   * @param {Object} observationData - Données de l'observation
   * @param {string} observationData.title - Titre de l'observation
   * @param {string} observationData.description - Description détaillée
   * @param {string} [observationData.type] - Code du type d'observation (WAV, OBS, etc.)
   * @param {string[]} [observationData.tags] - Tags associés
   * @param {Object} [observationData.location] - Coordonnées géographiques
   * @returns {string} Prompt formaté pour Gemini
   */
  buildAiPrompt(observationData) {
    const { title, description, type, tags, location } = observationData;

    // Base du prompt - style artistique cohérent
    let prompt = `Create a photorealistic, atmospheric illustration of a UFO/paranormal phenomenon observation. 
Style: Cinematic, dramatic lighting, slightly mysterious and eerie mood, night or dusk setting preferred.

`;

    // Ajouter le titre comme sujet principal
    prompt += `Main subject: ${title}\n\n`;

    // Ajouter la description complète
    prompt += `Detailed description: ${description}\n\n`;

    // Ajouter le contexte du type d'observation si disponible
    if (type && OBSERVATION_TYPES[type]) {
      const typeInfo = OBSERVATION_TYPES[type];
      prompt += `Phenomenon type: ${typeInfo.label} (${typeInfo.description})\n`;
    }

    // Ajouter les tags comme éléments visuels supplémentaires
    if (tags && tags.length > 0) {
      prompt += `Additional visual elements: ${tags.join(', ')}\n`;
    }

    // Ajouter un contexte géographique générique si disponible
    if (location && location.coordinates) {
      prompt += 'Setting: Outdoor landscape scene\n';
    }

    // Instructions finales pour la qualité
    prompt += `
Important: 
- No text or watermarks in the image
- High quality, detailed rendering
- Mysterious and captivating atmosphere
- Suitable for a scientific/documentary style report`;

    return prompt;
  }

  /**
   * Appelle l'API Gemini pour générer une image
   *
   * @param {string} prompt - Le prompt de génération
   * @returns {Promise<Buffer>} Buffer de l'image générée
   * @throws {Error} Si l'API échoue ou n'est pas configurée
   */
  async callGeminiApi(prompt) {
    const apiKey = process.env.GEMINI_API_KEY;

    console.log('🔑 GEMINI_API_KEY configurée:', apiKey ? `Oui (${apiKey.substring(0, 10)}...)` : 'NON!');

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY non configurée dans les variables d\'environnement');
    }

    const endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent';

    console.log('🤖 Appel API Gemini pour génération d\'image...');
    console.log('📝 Prompt:', prompt.substring(0, 200) + '...');
    console.log('🌐 Endpoint:', endpoint);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            responseModalities: ['TEXT', 'IMAGE']
          }
        })
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('❌ Erreur API Gemini:', response.status, errorBody);

        // Gestion des erreurs spécifiques
        if (response.status === 429) {
          throw new Error('Limite de requêtes Gemini atteinte. Le modèle expérimental a des quotas très limités. Réessayez dans quelques minutes.');
        }
        if (response.status === 403) {
          throw new Error('Accès refusé à l\'API Gemini. Vérifiez que la clé API est valide et que le modèle est accessible.');
        }
        if (response.status === 400) {
          throw new Error('Requête invalide vers Gemini. Le prompt ou la configuration peut être incorrecte.');
        }

        throw new Error(`Erreur API Gemini: ${response.status} - ${errorBody}`);
      }

      const data = await response.json();

      // Extraire l'image en base64 de la réponse
      const candidates = data.candidates;
      if (!candidates || candidates.length === 0) {
        throw new Error('Aucun candidat dans la réponse Gemini');
      }

      const parts = candidates[0].content?.parts;
      if (!parts || parts.length === 0) {
        throw new Error('Aucune partie dans la réponse Gemini');
      }

      // Chercher la partie contenant l'image
      const imagePart = parts.find(part => part.inlineData?.data);
      if (!imagePart) {
        throw new Error('Aucune image dans la réponse Gemini');
      }

      const base64Data = imagePart.inlineData.data;
      const mimeType = imagePart.inlineData.mimeType || 'image/png';

      console.log('✅ Image générée avec succès, mime:', mimeType);

      // Convertir base64 en Buffer
      const buffer = Buffer.from(base64Data, 'base64');

      return { buffer, mimeType };

    } catch (error) {
      console.error('❌ Erreur lors de l\'appel API Gemini:', error.message);
      throw error;
    }
  }

  /**
   * Génère une image IA pour une observation et l'upload sur Cloudinary
   *
   * @param {Object} observationData - Données de l'observation pour construire le prompt
   * @param {string} observationId - ID de l'observation MongoDB
   * @returns {Promise<Object>} Objet image avec source: 'ai'
   * @throws {Error} Si la génération ou l'upload échoue
   */
  async generateAiImage(observationData, observationId) {
    console.log(`🎨 Génération d'image IA pour l'observation ${observationId}...`);

    try {
      // 1. Construire le prompt
      const prompt = this.buildAiPrompt(observationData);

      // 2. Appeler l'API Gemini
      const { buffer, mimeType } = await this.callGeminiApi(prompt);

      // 3. Upload sur Cloudinary (avec compression)
      const compressed = await imageCompressor.compress(buffer, mimeType);

      const result = await uploadImage(compressed.buffer, {
        folder: 'phenom/observations/ai-generated',
        public_id: `ai_${observationId}_${Date.now()}`,
        maxWidth: 1920,
        maxHeight: 1920,
        quality: 85
      });

      console.log(`✅ Image IA uploadée sur Cloudinary: ${result.secure_url}`);

      // 4. Retourner l'objet image avec source: 'ai'
      return {
        publicId: result.public_id,
        url: result.secure_url,
        format: result.format,
        size: result.bytes,
        width: result.width,
        height: result.height,
        uploadedAt: new Date(),
        source: 'ai'
      };

    } catch (error) {
      console.error(`❌ Échec génération image IA pour ${observationId}:`, error.message);
      throw new Error(`Échec génération image IA: ${error.message}`);
    }
  }

  /**
   * Supprime une image de Cloudinary
   */
  async deleteImage(publicId) {
    try {
      const result = await deleteImage(publicId);

      if (result.result !== 'ok' && result.result !== 'not found') {
        throw new Error('IMAGE_DELETE_FAILED');
      }
    } catch (error) {
      if (error.message === 'IMAGE_DELETE_FAILED') {
        throw error;
      }
      throw new Error(`Erreur lors de la suppression: ${error.message}`);
    }
  }

  /**
   * Supprime plusieurs images
   */
  async deleteMultipleImages(publicIds) {
    try {
      if (!publicIds || publicIds.length === 0) {
        return 0;
      }

      const result = await deleteImages(publicIds);
      return result.deleted ? Object.keys(result.deleted).length : 0;
    } catch (error) {
      throw new Error(`Erreur lors de la suppression multiple: ${error.message}`);
    }
  }

  /**
   * Supprime toutes les images d'une observation (cascade)
   */
  async deleteAllImagesForObservation(observationId) {
    try {
      const Observation = (await import('../models/Observation.js')).default;
      const observation = await Observation.findById(observationId);

      if (!observation || !observation.images || observation.images.length === 0) {
        return 0;
      }

      const publicIds = observation.images.map(img => img.publicId);
      return await this.deleteMultipleImages(publicIds);
    } catch (error) {
      console.error(`Erreur lors de la suppression des images de l'observation ${observationId}:`, error);
      return 0;
    }
  }

  /**
   * Génère une URL optimisée
   */
  getImageUrl(publicId, options = {}) {
    return getImageUrl(publicId, options);
  }
}

export default new ImageService();
