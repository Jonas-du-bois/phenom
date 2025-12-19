/**
 * Composable pour accès caméra et capture photo
 * Gère l'accès à la caméra, la capture et la sélection de fichiers
 */
import { ref, onUnmounted } from "vue";

export function useCamera() {
  const stream = ref(null);
  const error = ref(null);
  const isActive = ref(false);
  const videoRef = ref(null);
  const facingMode = ref("environment"); // "user" pour selfie, "environment" pour arrière

  /**
   * Démarre la caméra
   */
  const startCamera = async (options = {}) => {
    try {
      error.value = null;

      // Arrêter un stream existant
      if (stream.value) {
        stopCamera();
      }

      const constraints = {
        video: {
          facingMode: options.facingMode || facingMode.value,
          width: { ideal: options.width || 1920 },
          height: { ideal: options.height || 1080 },
        },
        audio: false,
      };

      stream.value = await navigator.mediaDevices.getUserMedia(constraints);
      isActive.value = true;

      // Attacher au video element si fourni
      if (videoRef.value) {
        videoRef.value.srcObject = stream.value;
        await videoRef.value.play();
      }

      return stream.value;
    } catch (err) {
      console.error("❌ Erreur accès caméra:", err);
      error.value = getErrorMessage(err);
      isActive.value = false;
      throw err;
    }
  };

  /**
   * Arrête la caméra
   */
  const stopCamera = () => {
    if (stream.value) {
      stream.value.getTracks().forEach((track) => track.stop());
      stream.value = null;
    }

    if (videoRef.value) {
      videoRef.value.srcObject = null;
    }

    isActive.value = false;
  };

  /**
   * Capture une photo depuis le stream vidéo
   */
  const capturePhoto = (options = {}) => {
    if (!videoRef.value || !isActive.value) {
      throw new Error("Caméra non active");
    }

    const video = videoRef.value;
    const canvas = document.createElement("canvas");

    // Dimensions de la capture
    const width = options.width || video.videoWidth;
    const height = options.height || video.videoHeight;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");

    // Miroir si caméra frontale
    if (facingMode.value === "user" && options.mirror !== false) {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, width, height);

    // Retourner comme Blob
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
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
            reject(new Error("Échec de la capture"));
          }
        },
        "image/jpeg",
        options.quality || 0.9,
      );
    });
  };

  /**
   * Change de caméra (frontale/arrière)
   */
  const switchCamera = async () => {
    facingMode.value = facingMode.value === "user" ? "environment" : "user";

    if (isActive.value) {
      await startCamera();
    }

    return facingMode.value;
  };

  /**
   * Ouvre le sélecteur de fichiers pour la galerie
   */
  const openGallery = (options = {}) => {
    return new Promise((resolve, reject) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = options.accept || "image/*";
      input.multiple = options.multiple ?? true;
      input.capture = options.capture; // "camera" pour forcer la caméra sur mobile

      input.onchange = (event) => {
        const files = Array.from(event.target.files || []);

        if (files.length === 0) {
          reject(new Error("Aucun fichier sélectionné"));
          return;
        }

        // Créer des previews pour chaque fichier
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
              }),
          ),
        ).then(resolve);
      };

      input.oncancel = () => {
        reject(new Error("Sélection annulée"));
      };

      input.click();
    });
  };

  /**
   * Vérifie si la caméra est disponible
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
   * Obtient le message d'erreur approprié
   */
  const getErrorMessage = (err) => {
    switch (err.name) {
      case "NotAllowedError":
        return "Accès à la caméra refusé. Veuillez autoriser l'accès dans les paramètres.";
      case "NotFoundError":
        return "Aucune caméra détectée sur cet appareil.";
      case "NotReadableError":
        return "La caméra est utilisée par une autre application.";
      case "OverconstrainedError":
        return "Les paramètres demandés ne sont pas supportés.";
      default:
        return err.message || "Erreur d'accès à la caméra";
    }
  };

  /**
   * Attache une référence video element
   */
  const setVideoRef = (ref) => {
    videoRef.value = ref;
  };

  // Cleanup au démontage
  onUnmounted(() => {
    stopCamera();
  });

  return {
    // État
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
