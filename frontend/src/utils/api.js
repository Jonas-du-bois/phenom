/**
 * Configuration et wrapper pour les appels API
 * Axios avec intercepteurs pour JWT et refresh token
 */
import axios from "axios";
import { getAuthToken, saveAuthToken, removeAuthToken, removeUserData } from "./storage.js";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE_URL_LOCAL || 'http://localhost:3000';
const API_PREFIX = import.meta.env.VITE_API_PREFIX || '/api/v1';

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}${API_PREFIX}`,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// Routes publiques (pas de token)
const PUBLIC_ROUTES = ["/auth/login", "/auth/signup", "/auth/forgot-password", "/auth/reset-password", "/auth/refresh-token"];

// Intercepteur: ajouter le token
apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  const isPublic = PUBLIC_ROUTES.some(r => config.url?.includes(r));
  
  if (token && !isPublic) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Gestion refresh token
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(p => error ? p.reject(error) : p.resolve(token));
  failedQueue = [];
};

// Intercepteur: gérer 401 et refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      // Ne pas refresh pour les routes d'auth
      if (PUBLIC_ROUTES.some(r => originalRequest.url?.includes(r))) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await apiClient.post('/auth/refresh-token');
        const { accessToken } = response.data.data;
        saveAuthToken(accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        processQueue(null, accessToken);
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        removeAuthToken();
        removeUserData();
        if (!['/auth', '/login', '/tests'].includes(window.location.pathname)) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
