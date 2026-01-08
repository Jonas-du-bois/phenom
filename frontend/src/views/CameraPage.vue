<!--
  ============================================================================
  CameraPage.vue - Camera Capture and Observation Creation Page
  ============================================================================
  
  PURPOSE:
  Multi-step observation creation flow with camera capture capability.
  Allows users to take photos or select from gallery, then add observation details.

  FEATURES:
  - Live camera preview with capture button
  - Photo gallery selection alternative
  - Flash toggle control
  - Camera flip (front/back) control
  - Multi-step form for observation details
  - GPS location capture
  - Image preview and management

  MODES:
  - camera: Live camera viewfinder
  - preview: Photo preview before proceeding
  - form: Observation details form

  ROUTE: /camera (requires auth, hides tab bar)
  ============================================================================
-->

<template>
  <AppLayout :show-tab-bar="false" :has-content-padding="false">
    <div class="camera-page min-h-screen bg-[#000000] flex flex-col">
      <!-- Camera Mode -->
      <template v-if="mode === 'camera'">
        <!-- Camera preview -->
        <div class="relative flex-1">
          <!-- Video stream -->
          <video
            ref="videoRef"
            autoplay
            playsinline
            class="absolute inset-0 w-full h-full object-cover"
          />

          <!-- Canvas for capture -->
          <canvas ref="canvasRef" class="hidden" />

          <!-- Top controls -->
          <div
            class="absolute top-0 left-0 right-0 flex items-center justify-between p-4 z-10"
            :style="{
              paddingTop: 'calc(1rem + env(safe-area-inset-top, 0px))',
            }"
          >
            <IconButton
              variant="ghost"
              aria-label="Fermer la caméra"
              @click="handleClose"
            >
              <svg
                class="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </IconButton>

            <IconButton
              variant="ghost"
              aria-label="Activer le flash"
              @click="toggleFlash"
              :class="{ 'text-[#00F0FF]': flashEnabled }"
            >
              <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </IconButton>
          </div>

          <!-- Capture guide overlay -->
          <div class="absolute inset-0 pointer-events-none">
            <div
              class="absolute inset-8 border-2 border-white/30 rounded-3xl"
            />
          </div>

          <!-- Bottom controls -->
          <div
            class="absolute bottom-0 left-0 right-0 p-6 flex items-center justify-center gap-8"
            :style="{
              paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))',
            }"
          >
            <!-- Gallery picker -->
            <button
              @click="openGallery"
              class="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 overflow-hidden"
            >
              <img
                v-if="lastPhoto"
                :src="lastPhoto"
                alt=""
                class="w-full h-full object-cover"
              />
              <svg
                v-else
                class="w-6 h-6 m-auto text-white/60"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </button>

            <!-- Capture button -->
            <button
              @click="capturePhoto"
              class="capture-button w-20 h-20 rounded-full bg-white flex items-center justify-center active:scale-95 transition-transform"
              :disabled="capturing"
            >
              <div class="w-16 h-16 rounded-full border-4 border-black/20" />
            </button>

            <!-- Switch camera -->
            <IconButton
              variant="ghost"
              aria-label="Changer de caméra"
              @click="switchCamera"
              class="w-12 h-12"
            >
              <svg
                class="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </IconButton>
          </div>

          <input
            ref="galleryInput"
            type="file"
            accept="image/*,video/*"
            class="hidden"
            @change="handleGallerySelect"
          />
        </div>
      </template>

      <!-- Form Mode -->
      <template v-else>
        <PageHeader
          title="Nouvelle observation"
          show-back
          @back="mode = 'camera'"
        />

        <div class="flex-1 overflow-y-auto p-4 mt-18">
          <ObservationForm
            ref="formRef"
            :initial-data="formData"
            :submitting="submitting"
            @submit="handleSubmit"
            @media-change="handleMediaChange"
          />
        </div>
      </template>

      <!-- <div class="flex-1 overflow-y-auto p-4 mt-18">
          <ObservationForm
            ref="formRef"
            :initial-data="formData"
            :submitting="submitting"
            @submit="handleSubmit"
            @media-change="handleMediaChange"
          />
        </div>
      </template> -->

      <!-- Camera error -->
      <div
        v-if="cameraError"
        class="absolute inset-0 bg-[#000000] flex items-center justify-center"
      >
        <ErrorState title="Caméra non disponible" :description="cameraError">
          <template #action>
            <BaseButton variant="secondary" @click="openGallery">
              Choisir depuis la galerie
            </BaseButton>
          </template>
        </ErrorState>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { PageHeader, ObservationForm } from "@/components/organisms";
import { AppLayout } from "@/components/layout";
import { IconButton, BaseButton, ErrorState } from "@/components/atoms";
import { useObservationStore } from "@/stores/observation";

defineOptions({ name: "CameraPage" });

const router = useRouter();
const observationStore = useObservationStore();

const mode = ref("camera"); // 'camera' | 'form'
// showBadges removed — simplified form view
const videoRef = ref(null);
const canvasRef = ref(null);
const galleryInput = ref(null);
const formRef = ref(null);

const flashEnabled = ref(false);
const facingMode = ref("environment");
const capturing = ref(false);
const submitting = ref(false);
const cameraError = ref("");
const lastPhoto = ref("");

const formData = ref({
  media: [],
  title: "",
  description: "",
  type: "",
  date: new Date().toISOString().split("T")[0],
  time: new Date().toTimeString().slice(0, 5),
  duration: 0,
  location: "",
  coordinates: null,
  weather: "",
  witnesses: 1,
});

// Tabs removed — simplified camera → form flow

let mediaStream = null;

onMounted(async () => {
  await initCamera();
});

onUnmounted(() => {
  stopCamera();
});

const initCamera = async () => {
  try {
    const constraints = {
      video: {
        facingMode: facingMode.value,
        width: { ideal: 1920 },
        height: { ideal: 1080 },
      },
      audio: false,
    };

    mediaStream = await navigator.mediaDevices.getUserMedia(constraints);

    if (videoRef.value) {
      videoRef.value.srcObject = mediaStream;
    }

    cameraError.value = "";
  } catch (error) {
    console.error("Camera error:", error);
    cameraError.value =
      "Impossible d'accéder à la caméra. Vérifiez les permissions.";
  }
};

const stopCamera = () => {
  if (mediaStream) {
    mediaStream.getTracks().forEach((track) => track.stop());
    mediaStream = null;
  }
};

const switchCamera = async () => {
  facingMode.value =
    facingMode.value === "environment" ? "user" : "environment";
  stopCamera();
  await initCamera();
};

const toggleFlash = () => {
  flashEnabled.value = !flashEnabled.value;

  if (mediaStream) {
    const track = mediaStream.getVideoTracks()[0];
    if (track.getCapabilities?.()?.torch) {
      track.applyConstraints({
        advanced: [{ torch: flashEnabled.value }],
      });
    }
  }
};

const capturePhoto = () => {
  if (!videoRef.value || !canvasRef.value) return;

  capturing.value = true;

  const video = videoRef.value;
  const canvas = canvasRef.value;

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0);

  canvas.toBlob(
    (blob) => {
      const file = new File([blob], `capture-${Date.now()}.jpg`, {
        type: "image/jpeg",
      });
      formData.value.media = [file];
      lastPhoto.value = URL.createObjectURL(blob);

      stopCamera();
      mode.value = "form";
      capturing.value = false;
    },
    "image/jpeg",
    0.9
  );
};

const openGallery = () => {
  galleryInput.value?.click();
};

const handleGallerySelect = (e) => {
  const file = e.target.files?.[0];
  if (file) {
    formData.value.media = [file];
    lastPhoto.value = URL.createObjectURL(file);
    stopCamera();
    mode.value = "form";
  }
};

const handleMediaChange = (files) => {
  formData.value.media = files;
};

const handleSubmit = async (data) => {
  submitting.value = true;

  try {
    // Use the full form payload (ObservationForm contains many optional fields)
    const observationData = { ...data };

    // Extract any provided media file (some forms emit `media`, others `imageFile`) and
    // remove file-like props so we don't JSON-serialize File objects to the create endpoint.
    const mediaFile = data.media || data.imageFile || null;
    delete observationData.media;
    delete observationData.imageFile;

    // Omit empty locale to avoid backend validation errors for empty string
    if (observationData.locale === "") delete observationData.locale;

    // If explicit latitude/longitude provided, normalize into coordinates
    if (
      (observationData.latitude || observationData.latitude === 0) &&
      (observationData.longitude || observationData.longitude === 0)
    ) {
      observationData.coordinates = {
        lat: Number(observationData.latitude),
        lng: Number(observationData.longitude),
      };
      delete observationData.latitude;
      delete observationData.longitude;
    }

    const newObs = await observationStore.createObservation(observationData);

    if (!newObs || !(newObs._id || newObs.id)) {
      // Guard: ensure we have a valid created object before proceeding
      console.error(
        "Création observation: réponse invalide",
        newObs,
        observationStore.error
      );
      throw new Error("Réponse de création invalide");
    }

    // If IA image requested, call generate endpoint for the created observation
    if (data.generateAiImage && newObs && (newObs._id || newObs.id)) {
      try {
        await observationStore.generateAiImage(newObs._id || newObs.id);
      } catch (err) {
        // ignore generation error here; store.error will contain message
      }
    }

    // If a media file was provided (upload by user), upload it using the dedicated images endpoint
    if (mediaFile && newObs && (newObs._id || newObs.id)) {
      try {
        await observationStore.uploadObservationImages(
          newObs._id || newObs.id,
          mediaFile
        );
      } catch (err) {
        // ignore upload error here; store.error will contain message
      }
    }

    // Navigate to the new observation
    router.push(`/observation/${newObs?._id || newObs?.id}`);
  } catch (error) {
    // Error handled by store
  } finally {
    submitting.value = false;
  }
};

const handleClose = () => {
  router.back();
};
</script>

<style scoped>
.capture-button {
  box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.3);
}

.capture-button:active {
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
}
</style>
