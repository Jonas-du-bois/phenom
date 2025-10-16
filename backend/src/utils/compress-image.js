import sharp from 'sharp';
import imageConfig from '../config/image.config.js';

/**
 * Utilitaire de compression d'images
 * Responsabilité unique : transformer et optimiser les images
 */
class ImageCompressor {
  
  /**
   * Compresse une image selon son type MIME
   * @param {Buffer} buffer - Buffer de l'image originale
   * @param {string} mimetype - Type MIME de l'image (image/jpeg, image/png, image/webp)
   * @returns {Promise<{buffer: Buffer, mimetype: string, metadata: Object}>}
   */
  async compress(buffer, mimetype) {
    try {
      const startTime = Date.now();
      const originalSize = buffer.length;
      
      // Initialiser Sharp avec le buffer
      let sharpInstance = sharp(buffer);
      
      // Obtenir les métadonnées de l'image
      const metadata = await sharpInstance.metadata();
      
      // 1. Rotation automatique selon EXIF (photos smartphones)
      sharpInstance = sharpInstance.rotate();
      
      // 2. Redimensionnement si nécessaire
      if (this._needsResize(metadata)) {
        sharpInstance = sharpInstance.resize(
          imageConfig.maxWidth,
          imageConfig.maxHeight,
          imageConfig.resize
        );
      }
      
      // 3. Compression selon le format
      const { buffer: compressedBuffer, mimetype: outputMimetype } = 
        await this._compressByFormat(sharpInstance, mimetype);
      
      // 4. Calculer les statistiques
      const compressionStats = this._calculateStats(
        originalSize,
        compressedBuffer.length,
        startTime
      );
      
      // 5. Logger si verbose
      if (imageConfig.verbose) {
        this._logCompression(compressionStats);
      }
      
      return {
        buffer: compressedBuffer,
        mimetype: outputMimetype,
        metadata: {
          originalSize,
          compressedSize: compressedBuffer.length,
          compressionRatio: compressionStats.compressionRatio,
          savedBytes: compressionStats.savedBytes,
          processingTime: compressionStats.processingTime,
          originalDimensions: {
            width: metadata.width,
            height: metadata.height
          }
        }
      };
    } catch (error) {
      throw new Error(`Erreur lors de la compression de l'image: ${error.message}`);
    }
  }
  
  /**
   * Vérifie si l'image doit être redimensionnée
   * @private
   */
  _needsResize(metadata) {
    return (
      metadata.width > imageConfig.maxWidth ||
      metadata.height > imageConfig.maxHeight
    );
  }
  
  /**
   * Compresse l'image selon son format
   * @private
   */
  async _compressByFormat(sharpInstance, mimetype) {
    let compressedBuffer;
    let outputMimetype;
    
    switch (mimetype.toLowerCase()) {
      case 'image/jpeg':
      case 'image/jpg':
        compressedBuffer = await sharpInstance
          .jpeg(imageConfig.jpeg)
          .toBuffer();
        outputMimetype = 'image/jpeg';
        break;
        
      case 'image/png':
        compressedBuffer = await sharpInstance
          .png(imageConfig.png)
          .toBuffer();
        outputMimetype = 'image/png';
        break;
        
      case 'image/webp':
        compressedBuffer = await sharpInstance
          .webp(imageConfig.webp)
          .toBuffer();
        outputMimetype = 'image/webp';
        break;
        
      default:
        // Si format inconnu, convertir en JPEG par défaut
        console.warn(`Format ${mimetype} non supporté, conversion en JPEG`);
        compressedBuffer = await sharpInstance
          .jpeg(imageConfig.jpeg)
          .toBuffer();
        outputMimetype = 'image/jpeg';
    }
    
    return { buffer: compressedBuffer, mimetype: outputMimetype };
  }
  
  /**
   * Calcule les statistiques de compression
   * @private
   */
  _calculateStats(originalSize, compressedSize, startTime) {
    const savedBytes = originalSize - compressedSize;
    const compressionRatio = ((savedBytes / originalSize) * 100).toFixed(1);
    const processingTime = Date.now() - startTime;
    
    return {
      originalSize,
      compressedSize,
      savedBytes,
      compressionRatio: `${compressionRatio}%`,
      processingTime: `${processingTime}ms`
    };
  }
  
  /**
   * Log les informations de compression
   * @private
   */
  _logCompression(stats) {
    console.log('\n🗜️  Compression d\'image:');
    console.log(`   📸 Taille originale:  ${this._formatBytes(stats.originalSize)}`);
    console.log(`   ✅ Taille compressée: ${this._formatBytes(stats.compressedSize)}`);
    console.log(`   📉 Économie:          ${stats.compressionRatio} (${this._formatBytes(stats.savedBytes)})`);
    console.log(`   ⏱️  Temps:             ${stats.processingTime}\n`);
  }
  
  /**
   * Formate les bytes en format lisible
   * @private
   */
  _formatBytes(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
  
  /**
   * Valide qu'un buffer est une image valide
   * @param {Buffer} buffer - Buffer à valider
   * @returns {Promise<boolean>}
   */
  async validate(buffer) {
    try {
      const metadata = await sharp(buffer).metadata();
      return metadata.format !== undefined;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Génère une miniature
   * @param {Buffer} buffer - Buffer de l'image originale
   * @param {number} width - Largeur de la miniature
   * @param {number} height - Hauteur de la miniature
   * @returns {Promise<Buffer>}
   */
  async generateThumbnail(buffer, width = 300, height = 300) {
    try {
      return await sharp(buffer)
        .resize(width, height, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 80 })
        .toBuffer();
    } catch (error) {
      throw new Error(`Erreur lors de la génération de la miniature: ${error.message}`);
    }
  }
}

// Export singleton
export default new ImageCompressor();
