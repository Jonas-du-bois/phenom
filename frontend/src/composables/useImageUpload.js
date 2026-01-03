/**
 * useImageUpload Composable
 *
 * Centralized image upload and validation logic.
 * Handles file selection, preview generation, and server upload.
 *
 * @module composables/useImageUpload
 */

import { ref } from "vue";
import { validateImageFile, createImagePreview } from "../utils/imageHelpers";
import { imageService } from "../services/imageService";

export function useImageUpload(options = {}) {
  const {
    maxSize = 10 * 1024 * 1024, // 10 MB default
    allowedTypes = ["image/jpeg", "image/png", "image/webp"],
    autoPreview = true,
  } = options;

  // State
  const file = ref(null);
  const preview = ref(null);
  const uploading = ref(false);
  const error = ref(null);
  const uploadProgress = ref(0);

  /**
   * Handle file input selection
   * @param {Event} event - File input change event
   * @returns {boolean} True if file is valid
   */
  const handleFileSelect = async (event) => {
    const selectedFile = event.target.files[0];

    if (!selectedFile) {
      clearFile();
      return false;
    }

    // Validate the file
    const validation = validateImageFile(selectedFile, {
      maxSize,
      allowedTypes,
    });

    if (!validation.valid) {
      error.value = validation.error;
      event.target.value = ""; // Reset the input
      return false;
    }

    // Store the file
    file.value = selectedFile;
    error.value = null;

    // Create preview if enabled
    if (autoPreview) {
      try {
        preview.value = await createImagePreview(selectedFile);
        console.log("✅ Preview created");
      } catch (err) {
        console.error("❌ Error creating preview:", err);
      }
    }

    console.log("✅ File selected:", {
      name: selectedFile.name,
      size: `${(selectedFile.size / 1024).toFixed(2)} KB`,
      type: selectedFile.type,
    });

    return true;
  };

  /**
   * Upload file to server
   * @param {string} observationId - Observation ID (optional)
   * @returns {Promise<Object|null>} Server response or null on error
   */
  const uploadFile = async (observationId = null) => {
    if (!file.value) {
      error.value = "No file selected";
      return null;
    }

    try {
      uploading.value = true;
      error.value = null;
      uploadProgress.value = 0;

      let response;
      if (observationId) {
        // Upload to specific observation
        response = await imageService.uploadToObservation(
          observationId,
          file.value,
          {
            onUploadProgress: (progressEvent) => {
              uploadProgress.value = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
            },
          }
        );
      } else {
        // Generic upload
        response = await imageService.upload(file.value, {
          onUploadProgress: (progressEvent) => {
            uploadProgress.value = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
          },
        });
      }

      console.log("✅ Image uploaded successfully");
      return response;
    } catch (err) {
      console.error("❌ Upload error:", err);
      error.value =
        err.response?.data?.message || err.message || "Upload failed";
      return null;
    } finally {
      uploading.value = false;
    }
  };

  /**
   * Clear file and preview
   */
  const clearFile = () => {
    file.value = null;
    preview.value = null;
    error.value = null;
    uploadProgress.value = 0;
    console.log("✅ File cleared");
  };

  /**
   * Manually set a file
   * @param {File} newFile - New file to set
   * @returns {Promise<boolean>} True if file is valid
   */
  const setFile = async (newFile) => {
    const validation = validateImageFile(newFile, { maxSize, allowedTypes });

    if (!validation.valid) {
      error.value = validation.error;
      return false;
    }

    file.value = newFile;
    error.value = null;

    if (autoPreview) {
      try {
        preview.value = await createImagePreview(newFile);
      } catch (err) {
        console.error("❌ Error creating preview:", err);
      }
    }

    return true;
  };

  /**
   * Check if a file is selected
   * @returns {boolean} True if file is selected
   */
  const hasFile = () => {
    return file.value !== null;
  };

  /**
   * Get file information
   * @returns {Object|null} File information
   */
  const getFileInfo = () => {
    if (!file.value) return null;

    return {
      name: file.value.name,
      size: file.value.size,
      type: file.value.type,
      sizeKB: (file.value.size / 1024).toFixed(2),
      sizeMB: (file.value.size / (1024 * 1024)).toFixed(2),
    };
  };

  return {
    // State
    file,
    preview,
    uploading,
    error,
    uploadProgress,

    // Méthodes
    handleFileSelect,
    uploadFile,
    clearFile,
    setFile,
    hasFile,
    getFileInfo,
  };
}
