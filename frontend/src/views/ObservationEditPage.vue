<template>
  <div class="min-h-screen pt-20 pb-8 bg-[#000000]">
    <PageHeader title="Modifier l'observation" :showBack="true" />

    <main class="max-w-3xl mx-auto px-4 mt-6">
      <template v-if="loading">
        <div class="flex items-center justify-center h-60">
          <LoadingSpinner size="lg" />
        </div>
      </template>

      <template v-else-if="error">
        <div class="mt-6">
          <ErrorState title="Erreur" :description="error" />
        </div>
      </template>

      <template v-else>
        <div class="bg-[#0B0D10] rounded-2xl p-6">
          <ObservationForm
            :initialData="initialData"
            :submitting="submitting"
            submitLabel="Enregistrer les modifications"
            @submit="onSubmit"
            @media-change="onMediaChange"
          />
        </div>
      </template>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
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
      time = d.toTimeString().split(" ")[0].slice(0,5);
    } catch {}
  }

  const coords = obs?.coordinates || { lat: obs?.latitude, lng: obs?.longitude } || {};

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
    ufoShapes: obs.ufoShapes || obs.ufoShape ? [obs.ufoShape].filter(Boolean) : [],
    phenomena: obs.phenomena || obs.phenomenon ? [obs.phenomenon].filter(Boolean) : [],
    latitude: coords?.lat ?? obs.latitude ?? null,
    longitude: coords?.lng ?? obs.longitude ?? null,
    weather: obs.weather || "",
    witnesses: obs.witnesses ?? 1,
    media: obs.imageUrl || (obs.images && obs.images.length ? obs.images[0] : null),
    generateAiImage: obs.imageSource === "ai" || !!obs.generateAiImage || false,
  };
};

const load = async () => {
  loading.value = true;
  error.value = null;
  try {
    await observationStore.fetchObservationById(id);
    const obs = observationStore.currentObservation;
    if (!obs) throw new Error("Observation introuvable");
    initialData.value = mapObservationToForm(obs);
  } catch (err) {
    error.value = err?.message || "Erreur lors du chargement";
  } finally {
    loading.value = false;
  }
};

onMounted(() => load());

const onMediaChange = (fileOrNull) => {
  // Hook kept for extensibility (ObservationForm manages preview)
};

const onSubmit = async (data) => {
  submitting.value = true;
  try {
    const payload = { ...data };
    const imageFile = payload.imageFile;
    if (imageFile) delete payload.imageFile;

    await observationStore.updateObservation(id, payload);

    if (imageFile) {
      await observationStore.uploadObservationImages(id, imageFile);
    }

    toast.success("Observation mise à jour");
    router.push(`/observation/${id}`);
  } catch (err) {
    toast.error(err?.message || "Erreur lors de la mise à jour");
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
.min-h-screen { min-height: 100vh; }
</style>
