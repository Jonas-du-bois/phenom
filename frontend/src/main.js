import { createApp, watch } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "./style.css";

// Créer l'application
const app = createApp(App);
const pinia = createPinia();

// Installer les plugins
app.use(pinia);
app.use(router);

// Initialise une connexion WebSocket globale qui suit l'état d'auth
import { useWebSocket } from "@/composables/useWebSocket";
import { useAuthStore } from "@/stores/auth";
try {
	const ws = useWebSocket();
	const authStore = useAuthStore();

	// Connecte automatiquement quand un token est disponible
	watch(
		() => authStore.token,
		(token) => {
			if (token) {
				ws.connect(token).catch(() => {});
			} else {
				ws.disconnect();
			}
		},
		{ immediate: true }
	);
} catch (e) {
	console.warn('Could not initialize global websocket:', e);
}

// Monter l'application
app.mount("#app");

// Enregistrer le service worker (si supporté)
if ('serviceWorker' in navigator) {
	window.addEventListener('load', () => {
		navigator.serviceWorker.register('/service-worker.js').catch((err) => {
			console.warn('Service worker registration failed:', err);
		});
	});
}
