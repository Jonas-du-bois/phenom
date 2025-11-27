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
  withCredentials: true, // Envoyer les cookies HttpOnly avec chaque requête
});

// Clé de stockage du token (doit correspondre à storage.js)
const TOKEN_KEY = "phenom_auth_token";

// Intercepteur pour ajouter le token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);

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

// Variable pour éviter les appels multiples de refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Intercepteur pour gérer les erreurs et le refresh token automatique
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si erreur 401 et pas déjà une tentative de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Ne pas refresh pour les routes d'auth
      if (originalRequest.url?.includes('/auth/login') || 
          originalRequest.url?.includes('/auth/signup') ||
          originalRequest.url?.includes('/auth/refresh-token')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Mettre la requête en file d'attente
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        }).catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Appeler refresh-token (le cookie HttpOnly est envoyé automatiquement)
        const response = await apiClient.post('/auth/refresh-token');
        const { accessToken } = response.data.data;

        // Mettre à jour le token stocké (utiliser la même clé que storage.js)
        localStorage.setItem(TOKEN_KEY, accessToken);
        
        // Mettre à jour le header pour la requête originale
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        
        processQueue(null, accessToken);
        
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        
        // Refresh échoué - déconnecter l'utilisateur
        console.error('🔒 Session expirée - refresh échoué');
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem('phenom_user_data');
        
        // Ne pas rediriger si on est sur /old-home (page de test)
        if (window.location.pathname !== '/auth' && window.location.pathname !== '/old-home') {
          window.location.href = '/auth';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Gestion des autres erreurs
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || error.message;

      switch (status) {
        case 403:
          console.error('🚫 Accès refusé:', message);
          break;
        case 404:
          console.error('❌ Ressource non trouvée:', error.config.url);
          break;
        case 500:
          console.error('💥 Erreur serveur:', message);
          break;
        default:
          console.error(`⚠️ Erreur ${status}:`, message);
      }
    } else if (error.request) {
      console.error('🌐 Erreur réseau - serveur injoignable');
    } else {
      console.error('❌ Erreur:', error.message);
    }

    return Promise.reject(error);
  },
);

export default apiClient;
