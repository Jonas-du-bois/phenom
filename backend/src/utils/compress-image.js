import sharp from "sharp";
import imageConfig from "../config/image.config.js";

/**
 * Image compression utility
 * Single responsibility: transform and optimize images
 */
class ImageCompressor {
  /**
   * Compresses an image according to its MIME type
   * @param {Buffer} buffer - Original image buffer
   * @param {string} mimetype - Image MIME type (image/jpeg, image/png, image/webp)
   * @returns {Promise<{buffer: Buffer, mimetype: string, metadata: Object}>}
   */
  async compress(buffer, mimetype) {
    try {
      const startTime = Date.now();
      const originalSize = buffer.length;

      // Initialize Sharp with the buffer
      let sharpInstance = sharp(buffer);

      // Get image metadata
      const metadata = await sharpInstance.metadata();

      // 1. Auto-rotation based on EXIF (smartphone photos)
      sharpInstance = sharpInstance.rotate();

      // 2. Resize if necessary
      if (this._needsResize(metadata)) {
        sharpInstance = sharpInstance.resize(
          imageConfig.maxWidth,
          imageConfig.maxHeight,
          imageConfig.resize
        );
      }

      // 3. Compress according to format
      const { buffer: compressedBuffer, mimetype: outputMimetype } =
        await this._compressByFormat(sharpInstance, mimetype);

      // 4. Calculate statistics
      const compressionStats = this._calculateStats(
        originalSize,
        compressedBuffer.length,
        startTime
      );

      // 5. Log if verbose
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
            height: metadata.height,
          },
        },
      };
    } catch (error) {
      throw new Error(
        `Erreur lors de la compression de l'image: ${error.message}`
      );
    }
  }

  /**
   * Checks if the image needs to be resized
   * @private
   */
  _needsResize(metadata) {
    return (
      metadata.width > imageConfig.maxWidth ||
      metadata.height > imageConfig.maxHeight
    );
  }

  /**
   * Compresses the image according to its format
   * @private
   */
  async _compressByFormat(sharpInstance, mimetype) {
    let compressedBuffer;
    let outputMimetype;

    switch (mimetype.toLowerCase()) {
      case "image/jpeg":
      case "image/jpg":
        compressedBuffer = await sharpInstance
          .jpeg(imageConfig.jpeg)
          .toBuffer();
        outputMimetype = "image/jpeg";
        break;

      case "image/png":
        compressedBuffer = await sharpInstance.png(imageConfig.png).toBuffer();
        outputMimetype = "image/png";
        break;

      case "image/webp":
        compressedBuffer = await sharpInstance
          .webp(imageConfig.webp)
          .toBuffer();
        outputMimetype = "image/webp";
        break;

      default:
        // If unknown format, convert to JPEG by default
        console.warn(`Format ${mimetype} non supporté, conversion en JPEG`);
        compressedBuffer = await sharpInstance
          .jpeg(imageConfig.jpeg)
          .toBuffer();
        outputMimetype = "image/jpeg";
    }

    return { buffer: compressedBuffer, mimetype: outputMimetype };
  }

  /**
   * Calculates compression statistics
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
      processingTime: `${processingTime}ms`,
    };
  }

  /**
   * Logs compression information
   * @private
   */
  _logCompression(stats) {
    console.log("\n🗜️  Compression d'image:");
    console.log(
      `   📸 Taille originale:  ${this._formatBytes(stats.originalSize)}`
    );
    console.log(
      `   ✅ Taille compressée: ${this._formatBytes(stats.compressedSize)}`
    );
    console.log(
      `   📉 Économie:          ${stats.compressionRatio} (${this._formatBytes(
        stats.savedBytes
      )})`
    );
    console.log(`   ⏱️  Temps:             ${stats.processingTime}\n`);
  }

  /**
   * Formats bytes into a readable format
   * @private
   */
  _formatBytes(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
}

// Export singleton
export default new ImageCompressor();
