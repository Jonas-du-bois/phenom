/**
 * Camera Composable
 *
 * Manages camera access, photo capture, and file selection.
 * Provides a unified interface for device camera and gallery access.
 *
 * Features:
 * - Start/stop camera stream with front/back switching
 * - Capture photos from video stream
 * - Open file picker for gallery selection
 * - Error handling with user-friendly messages
 */
import { ref, onUnmounted } from "vue";

export function useCamera() {
  // ==========================================================================
  // REACTIVE STATE
  // ==========================================================================

  /** MediaStream from camera */
  const stream = ref(null);

  /** Error message if camera access fails */
  const error = ref(null);

  /** Whether camera is currently active */
  const isActive = ref(false);

  /** Reference to video HTML element */
  const videoRef = ref(null);

  /** Camera direction: "user" (front) or "environment" (back) */
  const facingMode = ref("environment");

  // ==========================================================================
  // CAMERA LIFECYCLE
  // ==========================================================================

  /**
   * Start the camera stream
   * @param {Object} options - Camera options
   * @param {string} options.facingMode - "user" for selfie, "environment" for back camera
   * @param {number} options.width - Desired video width
   * @param {number} options.height - Desired video height
   * @returns {Promise<MediaStream>} The camera stream
   */
  const startCamera = async (options = {}) => {
    try {
      error.value = null;

      // Stop any existing stream first
      if (stream.value) {
        stopCamera();
      }

      // Configure media constraints
      const constraints = {
        video: {
          facingMode: options.facingMode || facingMode.value,
          width: { ideal: options.width || 1920 },
          height: { ideal: options.height || 1080 },
        },
        audio: false,
      };

      // Request camera access
      stream.value = await navigator.mediaDevices.getUserMedia(constraints);
      isActive.value = true;

      // Attach stream to video element if provided
      if (videoRef.value) {
        videoRef.value.srcObject = stream.value;
        await videoRef.value.play();
      }

      return stream.value;
    } catch (err) {
      console.error("❌ Camera access error:", err);
      error.value = getErrorMessage(err);
      isActive.value = false;
      throw err;
    }
  };

  /**
   * Stop the camera stream and release resources
   */
  const stopCamera = () => {
    if (stream.value) {
      // Stop all tracks to release camera
      stream.value.getTracks().forEach((track) => track.stop());
      stream.value = null;
    }

    // Clear video element
    if (videoRef.value) {
      videoRef.value.srcObject = null;
    }

    isActive.value = false;
  };

  // ==========================================================================
  // PHOTO CAPTURE
  // ==========================================================================

  /**
   * Capture a photo from the video stream
   * @param {Object} options - Capture options
   * @param {number} options.width - Output width (default: video width)
   * @param {number} options.height - Output height (default: video height)
   * @param {number} options.quality - JPEG quality 0-1 (default: 0.9)
   * @param {boolean} options.mirror - Mirror image for front camera (default: true)
   * @returns {Promise<Object>} Photo data { file, blob, dataUrl, width, height }
   */
  const capturePhoto = (options = {}) => {
    if (!videoRef.value || !isActive.value) {
      throw new Error("Camera not active");
    }

    const video = videoRef.value;
    const canvas = document.createElement("canvas");

    // Set capture dimensions
    const width = options.width || video.videoWidth;
    const height = options.height || video.videoHeight;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");

    // Mirror image for front camera (selfie mode)
    if (facingMode.value === "user" && options.mirror !== false) {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
    }

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, width, height);

    // Convert to Blob and return
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            // Create File object for upload
            const file = new File([blob], `photo-${Date.now()}.jpg`, {
              type: "image/jpeg",
            });
            resolve({
              file,
              blob,
              dataUrl: canvas.toDataURL("image/jpeg", options.quality || 0.9),
              width,
              height,
            });
          } else {
            reject(new Error("Capture failed"));
          }
        },
        "image/jpeg",
        options.quality || 0.9
      );
    });
  };

  /**
   * Switch between front and back camera
   * @returns {Promise<string>} New facing mode
   */
  const switchCamera = async () => {
    facingMode.value = facingMode.value === "user" ? "environment" : "user";

    // Restart camera with new facing mode if active
    if (isActive.value) {
      await startCamera();
    }

    return facingMode.value;
  };

  // ==========================================================================
  // GALLERY / FILE SELECTION
  // ==========================================================================

  /**
   * Open file picker for image selection
   * @param {Object} options - Picker options
   * @param {string} options.accept - File types (default: "image/*")
   * @param {boolean} options.multiple - Allow multiple selection (default: true)
   * @param {string} options.capture - Force camera on mobile ("camera")
   * @returns {Promise<Array>} Selected files with previews
   */
  const openGallery = (options = {}) => {
    return new Promise((resolve, reject) => {
      // Create hidden file input
      const input = document.createElement("input");
      input.type = "file";
      input.accept = options.accept || "image/*";
      input.multiple = options.multiple ?? true;
      input.capture = options.capture; // "camera" forces camera on mobile

      // Handle file selection
      input.onchange = (event) => {
        const files = Array.from(event.target.files || []);

        if (files.length === 0) {
          reject(new Error("No file selected"));
          return;
        }

        // Create previews for each file
        Promise.all(
          files.map(
            (file) =>
              new Promise((res) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                  res({
                    file,
                    dataUrl: e.target.result,
                    name: file.name,
                    size: file.size,
                    type: file.type,
                  });
                };
                reader.readAsDataURL(file);
              })
          )
        ).then(resolve);
      };

      // Handle cancel
      input.oncancel = () => {
        reject(new Error("Selection cancelled"));
      };

      // Trigger file picker
      input.click();
    });
  };

  // ==========================================================================
  // UTILITIES
  // ==========================================================================

  /**
   * Check if camera is available on this device
   * @returns {Promise<boolean>} True if camera exists
   */
  const checkCameraAvailable = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.some((device) => device.kind === "videoinput");
    } catch {
      return false;
    }
  };

  /**
   * Get user-friendly error message for camera errors
   * @param {Error} err - The error object
   * @returns {string} User-friendly message
   */
  const getErrorMessage = (err) => {
    switch (err.name) {
      case "NotAllowedError":
        return "Camera access denied. Please allow access in settings.";
      case "NotFoundError":
        return "No camera detected on this device.";
      case "NotReadableError":
        return "Camera is in use by another application.";
      case "OverconstrainedError":
        return "Requested camera settings are not supported.";
      default:
        return err.message || "Camera access error";
    }
  };

  /**
   * Set the video element reference
   * @param {HTMLVideoElement} ref - Video element
   */
  const setVideoRef = (ref) => {
    videoRef.value = ref;
  };

  // ==========================================================================
  // CLEANUP
  // ==========================================================================

  // Stop camera when component unmounts
  onUnmounted(() => {
    stopCamera();
  });

  // ==========================================================================
  // RETURN PUBLIC API
  // ==========================================================================

  return {
    // State
    stream,
    error,
    isActive,
    facingMode,
    videoRef,

    // Actions
    startCamera,
    stopCamera,
    capturePhoto,
    switchCamera,
    openGallery,
    checkCameraAvailable,
    setVideoRef,
  };
}
