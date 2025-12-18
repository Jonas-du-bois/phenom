/**
 * Store Pinia pour l'authentification
 * Gère l'état de l'utilisateur connecté et les tokens JWT
 */
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { authService } from "../services/authService";
import { saveAuthToken, getAuthToken, removeAuthToken, saveUserData, getUserData, removeUserData } from "../utils/storage";

export const useAuthStore = defineStore("auth", () => {
  // État
  const user = ref(getUserData());
  const token = ref(getAuthToken());
  const loading = ref(false);
  const error = ref(null);
  const initialized = ref(false);

  // Computed
  const isAuthenticated = computed(() => !!token.value && !!user.value);
  const isAdmin = computed(() => user.value?.role === "admin");
  const userName = computed(() => user.value?.name || user.value?.email || "");
  const userAvatar = computed(() => user.value?.avatar || null);

  /**
   * Initialise l'auth store (appelé au démarrage de l'app)
   */
  const initialize = async () => {
    if (initialized.value) return;
    
    if (token.value) {
      try {
        await fetchUser();
      } catch (err) {
        clearAuth();
      }
    }
    initialized.value = true;
  };

  /**
   * Connexion utilisateur
   */
  const login = async (credentials) => {
    try {
      loading.value = true;
      error.value = null;

      const response = await authService.login(credentials);
      const { user: userData, accessToken } = response.data;
      
      // Stocker le token et l'utilisateur
      token.value = accessToken;
      user.value = userData;
      saveAuthToken(accessToken);
      saveUserData(userData);
      
      return { success: true };
    } catch (err) {
      error.value = err.response?.data?.message || "Erreur de connexion";
      return { success: false, error: error.value };
    } finally {
      loading.value = false;
    }
  };

  /**
   * Inscription utilisateur
   */
  const register = async (userData) => {
    try {
      loading.value = true;
      error.value = null;

      const response = await authService.register(userData);
      const { user: newUser, accessToken } = response.data;
      
      token.value = accessToken;
      user.value = newUser;
      saveAuthToken(accessToken);
      saveUserData(newUser);
      
      return { success: true };
    } catch (err) {
      error.value = err.response?.data?.message || "Erreur d'inscription";
      return { success: false, error: error.value };
    } finally {
      loading.value = false;
    }
  };

  /**
   * Déconnexion
   */
  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.warn("Logout API failed:", err);
    } finally {
      clearAuth();
    }
  };

  /**
   * Récupère le profil utilisateur
   */
  const fetchUser = async () => {
    if (!token.value) return null;
    
    try {
      loading.value = true;
      const response = await authService.getProfile();
      user.value = response.data;
      saveUserData(response.data);
      return user.value;
    } catch (err) {
      if (err.response?.status === 401) {
        clearAuth();
      }
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Nettoie les données d'auth
   */
  const clearAuth = () => {
    user.value = null;
    token.value = null;
    error.value = null;
    removeAuthToken();
    removeUserData();
  };

  return {
    // État
    user,
    token,
    loading,
    error,
    initialized,
    
    // Computed
    isAuthenticated,
    isAdmin,
    userName,
    userAvatar,
    
    // Actions
    initialize,
    login,
    register,
    logout,
    fetchUser,
    clearAuth,
  };
});
