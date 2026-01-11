<!--
  ============================================================================
  ObservationEditPage.vue - Edit Existing Observation Page
  ============================================================================
  
  PURPOSE:
  Allows users to edit an existing observation's details.
  Only accessible by the observation owner or admin.

  FEATURES:
  - Pre-populated form with existing observation data
  - Edit title, description, type, location, and other metadata
  - Add or remove images
  - Loading and error states
  - Success toast on save

  ROUTE: /observation/:id/edit (requires auth + ownership/admin)
  ============================================================================
-->

<template>
  <AppLayout :show-tab-bar="false" :has-content-padding="false">
    <div class="camera-page min-h-screen bg-[#000000] flex flex-col">
      <PageHeader
        title="Modifier l'observation"
        show-back
        @back="$router.back()"
      />

      <template v-if="loading">
        <div class="flex items-center justify-center h-60">
          <LoadingSpinner size="lg" />
        </div>
      </template>

      <template v-else-if="error">
        <div class="flex-1 flex items-center justify-center p-4">
          <ErrorState title="Erreur" :description="error" />
        </div>
      </template>

      <template v-else>
        <div class="flex-1 overflow-y-auto p-4 pt-20">
          <ObservationForm
            :initialData="initialData"
            :submitting="submitting"
            submitLabel="Enregistrer les modifications"
            @submit="onSubmit"
            @media-change="onMediaChange"
          />
        </div>
      </template>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { AppLayout } from "@/components/layout";
import { PageHeader, ObservationForm } from "@/components/organisms";
import { LoadingSpinner, ErrorState } from "@/components/atoms";
import { useObservationStore } from "@/stores/observation";
import { useToast } from "@/composables/useToast";

const route = useRoute();
const router = useRouter();
const toast = useToast();
const observationStore = useObservationStore();

const id = route.params.id;
const loading = ref(true);
const error = ref(null);
const submitting = ref(false);
const initialData = ref({});

const mapObservationToForm = (obs) => {
  const today = new Date().toISOString().split("T")[0];
  const dateIso = obs?.date || obs?.createdAt || null;
  let date = today;
  let time = "";
  if (dateIso) {
    try {
      const d = new Date(dateIso);
      date = d.toISOString().split("T")[0];
      time = d.toTimeString().split(" ")[0].slice(0, 5);
    } catch {
      // empty catch block: ignore error
    }
  }

  const coords =
    obs?.coordinates || { lat: obs?.latitude, lng: obs?.longitude } || {};

  return {
    date,
    time: obs.time || time,
    location: obs.location || obs.place || "",
    country: obs.country || "Suisse",
    locale: obs.locale || "",
    description: obs.description || "",
    credibility: obs.credibility ?? 5,
    strangeness: obs.strangeness ?? 5,
    duration: obs.duration ?? null,
    observerTypes: obs.observerTypes || [],
    ufoShapes:
      obs.ufoShapes || obs.ufoShape ? [obs.ufoShape].filter(Boolean) : [],
    phenomena:
      obs.phenomena || obs.phenomenon ? [obs.phenomenon].filter(Boolean) : [],
    latitude: coords?.lat ?? obs.latitude ?? null,
    longitude: coords?.lng ?? obs.longitude ?? null,
    weather: obs.weather || "",
    witnesses: obs.witnesses ?? 1,
    media: extractImageUrls(obs),
    existingImages: extractImageUrls(obs),
    generateAiImage: obs.imageSource === "ai" || !!obs.generateAiImage || false,
  };
};

const extractImageUrls = (obs) => {
  // Gérer différents formats d'images
  const images = [];

  // Si images est un tableau d'objets ou de strings
  if (obs.images && Array.isArray(obs.images)) {
    obs.images.forEach((img) => {
      if (typeof img === "string") {
        images.push(img);
      } else if (img && img.url) {
        images.push(img.url);
      } else if (img && img.src) {
        images.push(img.src);
      }
    });
  }

  // Si imageUrl existe (ancienne structure)
  if (obs.imageUrl && !images.includes(obs.imageUrl)) {
    images.push(obs.imageUrl);
  }

  console.log("Images extraites:", images);
  return images;
};

const load = async () => {
  loading.value = true;
  error.value = null;
  try {
    await observationStore.fetchObservationById(id);
    const obs = observationStore.currentObservation;
    console.log("Observation chargée:", obs);
    if (!obs) throw new Error("Observation introuvable");
    initialData.value = mapObservationToForm(obs);
    console.log("InitialData mappé:", initialData.value);
  } catch (err) {
    console.error("Erreur load:", err);
    error.value = err?.message || "Erreur lors du chargement";
  } finally {
    loading.value = false;
  }
};

onMounted(() => load());
// eslint-disable-next-line no-unused-vars
const onMediaChange = (fileOrNull) => {
  // Hook kept for extensibility (ObservationForm manages preview)
};

const onSubmit = async (data) => {
  submitting.value = true;
  try {
    const payload = { ...data };
    const newFiles =
      payload.imageFile?.filter((item) => item instanceof File) || [];
    const existingUrls =
      payload.imageFile?.filter((item) => typeof item === "string") || [];
    delete payload.imageFile;

    // Mettre à jour avec les URLs existantes conservées
    payload.images = existingUrls;
    await observationStore.updateObservation(id, payload);

    // Ajouter les nouvelles images
    if (newFiles.length > 0) {
      await observationStore.uploadObservationImages(id, newFiles);
    }

    toast.success("Observation mise à jour");

    // Redirect to observation detail page
    await router.push({ name: "observation-detail", params: { id } });
  } catch (err) {
    console.error("Erreur lors de la mise à jour:", err);
    toast.error(err?.message || "Erreur lors de la mise à jour");
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
.min-h-screen {
  min-height: 100vh;
}
</style>
