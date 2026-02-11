/**
 * Authentication Pinia Store
 *
 * Manages authenticated user state and JWT tokens.
 * Provides login, register, logout, and profile fetching actions.
 * Persists auth data to localStorage for session recovery.
 */
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { authService } from "../services/authService";
import {
  saveAuthToken,
  getAuthToken,
  removeAuthToken,
  saveUserData,
  getUserData,
  removeUserData,
} from "../utils/storage";

export const useAuthStore = defineStore("auth", () => {
  // ==========================================================================
  // STATE
  // ==========================================================================

  /** Current authenticated user object */
  const user = ref(getUserData());

  /** JWT access token */
  const token = ref(getAuthToken());

  /** Loading state for async operations */
  const loading = ref(false);

  /** Error message from last failed operation */
  const error = ref(null);

  /** Whether store has been initialized */
  const initialized = ref(false);

  // ==========================================================================
  // COMPUTED GETTERS
  // ==========================================================================

  /** Check if user is authenticated */
  const isAuthenticated = computed(() => !!token.value && !!user.value);

  /** Check if user has admin role */
  const isAdmin = computed(() => user.value?.role === "admin");

  /** User display name (name or email fallback) */
  const userName = computed(() => user.value?.name || user.value?.email || "");

  /** User avatar URL */
  const userAvatar = computed(() => user.value?.avatar || null);

  // ==========================================================================
  // ACTIONS
  // ==========================================================================

  /**
   * Initialize auth store (called on app startup)
   * Validates existing token and fetches user profile
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
   * Login with credentials
   * @param {Object} credentials - { email, password }
   * @returns {Object} { success, error? }
   */
  const login = async (credentials) => {
    try {
      loading.value = true;
      error.value = null;

      const response = await authService.login(credentials);
      const { user: userData, accessToken } = response.data;

      // Store token and user data
      token.value = accessToken;
      user.value = userData;
      saveAuthToken(accessToken);
      saveUserData(userData);

      // Send auth data to service worker for background tasks
      sendToServiceWorker("STORE_AUTH", {
        token: accessToken,
        userId: userData._id,
      });

      return { success: true };
    } catch (err) {
      error.value = err.response?.data?.message || "Login error";
      return { success: false, error: error.value };
    } finally {
      loading.value = false;
    }
  };

  /**
   * Register new user account
   * @param {Object} userData - { name, email, password }
   * @returns {Object} { success, error? }
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

      // Send auth data to service worker for background tasks
      sendToServiceWorker("STORE_AUTH", {
        token: accessToken,
        userId: newUser._id,
      });

      return { success: true };
    } catch (err) {
      error.value = err.response?.data?.message || "Registration error";
      return { success: false, error: error.value };
    } finally {
      loading.value = false;
    }
  };

  /**
   * Logout current user
   * Clears all auth data from state and localStorage
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
   * Fetch current user profile from API
   * Updates local user state on success
   * @returns {Object|null} User data or null
   */
  const fetchUser = async () => {
    if (!token.value) return null;

    try {
      loading.value = true;
      const response = await authService.getProfile();
      user.value = response.data;
      saveUserData(response.data);

      // Update service worker with current auth
      sendToServiceWorker("STORE_AUTH", {
        token: token.value,
        userId: response.data._id,
      });

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
   * Clear all auth data (logout helper)
   */
  const clearAuth = () => {
    user.value = null;
    token.value = null;
    error.value = null;
    removeAuthToken();
    removeUserData();

    // Clear auth from service worker
    sendToServiceWorker("CLEAR_AUTH", {});
  };

  /**
   * Send message to service worker
   * Used to share auth data for background sync tasks
   */
  const sendToServiceWorker = (type, payload) => {
    if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type, payload });
    }
  };

  return {
    // State
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
    sendToServiceWorker,
  };
});
