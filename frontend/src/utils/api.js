/**
 * API Client Configuration
 *
 * Axios wrapper with interceptors for JWT authentication.
 * Handles automatic token refresh on 401 errors.
 *
 * Features:
 * - Automatic Authorization header injection
 * - Token refresh with request queueing
 * - Automatic logout on refresh failure
 * - Global error toast notifications
 */
import axios from "axios";
import {
  getAuthToken,
  saveAuthToken,
  removeAuthToken,
  removeUserData,
} from "./storage.js";

// Lazy import toast to avoid circular dependencies
let toastInstance = null;
const getToast = async () => {
  if (!toastInstance) {
    const { useToast } = await import("../composables/useToast.js");
    toastInstance = useToast();
  }
  return toastInstance;
};

// ============================================================================
// API CONFIGURATION
// ============================================================================

/** Base API URL from environment or localhost fallback */
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_BASE_URL_LOCAL ||
  "http://localhost:3000";

/** API version prefix */
const API_PREFIX = import.meta.env.VITE_API_PREFIX || "/api/v1";

/** Axios instance with default configuration */
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}${API_PREFIX}`,
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // Send cookies for refresh token
});

// ============================================================================
// PUBLIC ROUTES (no authentication required)
// ============================================================================

const PUBLIC_ROUTES = [
  "/auth/login",
  "/auth/signup",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/refresh-token",
];

// ============================================================================
// REQUEST INTERCEPTOR - Add Authorization header
// ============================================================================

apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  const isPublic = PUBLIC_ROUTES.some((r) => config.url?.includes(r));

  // Add Bearer token for authenticated routes
  if (token && !isPublic) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ============================================================================
// RESPONSE INTERCEPTOR - Handle 401 and token refresh
// ============================================================================

/** Flag to prevent multiple simultaneous refresh attempts */
let isRefreshing = false;

/** Queue of requests waiting for token refresh */
let failedQueue = [];

/**
 * Process queued requests after token refresh
 * @param {Error|null} error - Refresh error or null on success
 * @param {string|null} token - New access token
 */
const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't try to refresh for auth routes
      if (PUBLIC_ROUTES.some((r) => originalRequest.url?.includes(r))) {
        // Show error toast for failed login/signup
        const toast = await getToast();
        const errorMsg =
          error.response?.data?.message || "Erreur d'authentification";
        toast.error(errorMsg);
        return Promise.reject(error);
      }

      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        });
      }

      // Mark request as retry attempt
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt to refresh the access token
        const response = await apiClient.post("/auth/refresh-token");
        const { accessToken } = response.data.data;

        // Save new token and retry queued requests
        saveAuthToken(accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        processQueue(null, accessToken);
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed - logout user
        processQueue(refreshError, null);
        removeAuthToken();
        removeUserData();

        // Show session expired toast
        const toast = await getToast();
        toast.error("Session expirée. Veuillez vous reconnecter.");

        // Redirect to login (unless already on auth page)
        if (!["/auth", "/login", "/tests"].includes(window.location.pathname)) {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle all other errors with toast notifications
    if (error.response) {
      // Server responded with error status
      const toast = await getToast();
      const status = error.response.status;
      const errorData = error.response.data;

      // Extract error message from various formats
      let errorMessage = "Une erreur est survenue";

      if (errorData?.message) {
        errorMessage = errorData.message;
      } else if (errorData?.error) {
        errorMessage = errorData.error;
      } else if (typeof errorData === "string") {
        errorMessage = errorData;
      } else if (status === 403) {
        errorMessage = "Accès refusé";
      } else if (status === 404) {
        errorMessage = "Ressource introuvable";
      } else if (status === 500) {
        errorMessage = "Erreur serveur";
      } else if (status >= 400 && status < 500) {
        errorMessage = "Requête invalide";
      }

      toast.error(errorMessage);
    } else if (error.request) {
      // Request made but no response received (network error)
      const toast = await getToast();
      toast.error("Erreur de connexion. Vérifiez votre réseau.");
    } else {
      // Something else happened
      const toast = await getToast();
      toast.error("Une erreur inattendue est survenue");
    }

    return Promise.reject(error);
  },
);

export default apiClient;
