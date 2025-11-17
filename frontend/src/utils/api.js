/**
 * Configuration et wrapper pour les appels API
 */
import axios from "axios";

// Construire l'URL complète de l'API
// VITE_API_BASE_URL = https://phenom-backend.onrender.com
// VITE_API_PREFIX = /api/v1
// Résultat = https://phenom-backend.onrender.com/api/v1
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; //|| 'https://phenom-backend.onrender.com'
const API_PREFIX = import.meta.env.VITE_API_PREFIX; //|| '/api/v1'
const API_URL = `${API_BASE_URL}${API_PREFIX}`;

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Intercepteur pour ajouter le token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  console.log("🔧 Interceptor request:", {
    url: config.url,
    hasToken: !!token,
  });

  // Routes qui ne nécessitent pas de token
  const publicRoutes = [
    "/auth/login",
    "/auth/signup",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/auth/refresh-token",
  ];
  const isPublicRoute = publicRoutes.some((route) =>
    config.url?.includes(route),
  );

  console.log("🔧 Is public route?", isPublicRoute);

  if (token && !isPublicRoute) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log("🔧 Token ajouté au header");
  } else {
    console.log("🔧 Pas de token ajouté (public route ou pas de token)");
  }

  return config;
});

// Intercepteur pour gérer les erreurs
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Gestion des erreurs globales
    if (error.response) {
      // Erreur de réponse du serveur
      const status = error.response.status;
      const message = error.response.data?.message || error.message;

      switch (status) {
        case 401:
          // Non autorisé - token invalide ou expiré
          if (!error.config.url?.includes("/auth/login")) {
            console.error("🔒 Session expirée - redirection nécessaire");
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            // Rediriger vers login si nécessaire
            if (window.location.pathname !== "/auth") {
              window.location.href = "/auth";
            }
          }
          break;
        case 403:
          console.error("🚫 Accès refusé:", message);
          break;
        case 404:
          console.error("❌ Ressource non trouvée:", error.config.url);
          break;
        case 500:
          console.error("💥 Erreur serveur:", message);
          break;
        default:
          console.error(`⚠️ Erreur ${status}:`, message);
      }
    } else if (error.request) {
      // Erreur réseau - pas de réponse reçue
      console.error("🌐 Erreur réseau - serveur injoignable");
    } else {
      // Autre erreur
      console.error("❌ Erreur:", error.message);
    }

    return Promise.reject(error);
  },
);

export default apiClient;
