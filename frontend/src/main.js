import { createApp } from "vue";
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

// Monter l'application
app.mount("#app");
