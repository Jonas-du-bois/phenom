/**
 * Authentication Composable
 *
 * Manages user authentication state and actions.
 * KISS principle: Simple, focused on essential actions only.
 *
 * Features:
 * - Login with email/password
 * - User registration
 * - Logout with token cleanup
 * - Profile loading and persistence
 * - Auto-initialization from localStorage
 */
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { authService } from "../services/authService";

// ============================================================================
// SHARED STATE (Singleton pattern - shared across all component instances)
// ============================================================================

/** Current authenticated user object */
const user = ref(null);

/** JWT access token for API authentication */
const token = ref(localStorage.getItem("token") || null);

/** Loading state for async operations */
const loading = ref(false);

/** Error message from last failed operation */
const error = ref(null);

// ============================================================================
// COMPOSABLE FUNCTION
// ============================================================================

export function useAuth() {
  const router = useRouter();

  // ==========================================================================
  // COMPUTED PROPERTIES
  // ==========================================================================

  /** Check if user is currently authenticated */
  const isAuthenticated = computed(() => !!token.value && !!user.value);

  /** Check if current user has admin role */
  const isAdmin = computed(() => user.value?.role === "admin");

  // ==========================================================================
  // AUTHENTICATION ACTIONS
  // ==========================================================================

  /**
   * Login with email and password
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @returns {Promise<boolean>} Success status
   */
  const login = async (email, password) => {
    try {
      loading.value = true;
      error.value = null;

      const response = await authService.login({ email, password });

      console.log("🔍 Full response:", response);
      console.log("🔍 response.data:", response.data);

      // authService returns response.data from backend: { success: true, data: { user, accessToken } }
      // Note: refreshToken is now stored in an HttpOnly cookie (not accessible via JS)
      const { user: userData, accessToken } = response.data;

      console.log("🔍 userData:", userData);
      console.log("🔍 accessToken:", accessToken);

      // Update state
      token.value = accessToken;
      user.value = userData;

      // Persist to localStorage for session recovery
      localStorage.setItem("token", accessToken);
      localStorage.setItem("user", JSON.stringify(userData));

      return true;
    } catch (err) {
      console.error("❌ Login error:", err);
      error.value = err.response?.data?.message || "Login error";
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Register a new user account
   * @param {string} name - User's display name
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @returns {Promise<boolean>} Success status
   */
  const register = async (name, email, password) => {
    try {
      loading.value = true;
      error.value = null;

      const response = await authService.register({ name, email, password });

      // authService returns response.data: { success: true, data: { user, accessToken } }
      // Note: refreshToken is now stored in an HttpOnly cookie (not accessible via JS)
      const { user: userData, accessToken } = response.data;

      // Update state
      token.value = accessToken;
      user.value = userData;

      // Persist to localStorage
      localStorage.setItem("token", accessToken);
      localStorage.setItem("user", JSON.stringify(userData));

      return true;
    } catch (err) {
      console.error("❌ Registration error:", err);
      error.value = err.response?.data?.message || "Registration error";
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Logout current user
   * Clears all auth state and redirects to auth page
   */
  const logout = async () => {
    try {
      // Call backend to invalidate token/refresh token
      await authService.logout();
    } catch (error) {
      console.error("❌ Logout error:", error);
      // Continue with local cleanup anyway
    } finally {
      // Clear local state
      token.value = null;
      user.value = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Redirect to authentication page
      router.push("/auth");
    }
  };

  // ==========================================================================
  // PROFILE MANAGEMENT
  // ==========================================================================

  /**
   * Load current user's profile from API
   * Updates local user state and localStorage
   */
  const loadProfile = async () => {
    try {
      loading.value = true;
      const response = await authService.getProfile();
      // Backend returns: { success: true, data: { user } }
      user.value = response.data;
      localStorage.setItem("user", JSON.stringify(user.value));
    } catch (err) {
      console.error("Profile loading error:", err);
      // If token is invalid, logout user
      if (err.response?.status === 401) {
        logout();
      }
    } finally {
      loading.value = false;
    }
  };

  // ==========================================================================
  // INITIALIZATION
  // ==========================================================================

  /**
   * Initialize auth state from localStorage
   * Called on app startup to restore previous session
   */
  const init = () => {
    const savedUser = localStorage.getItem("user");
    if (savedUser && token.value) {
      try {
        user.value = JSON.parse(savedUser);
      } catch (e) {
        console.error("User parsing error:", e);
        logout();
      }
    }
  };

  // Auto-initialize if token exists but user not loaded
  if (!user.value && token.value) {
    init();
  }

  // ==========================================================================
  // RETURN PUBLIC API
  // ==========================================================================

  return {
    // State
    user,
    token,
    loading,
    error,
    isAuthenticated,
    isAdmin,

    // Actions
    login,
    register,
    logout,
    loadProfile,
    init,
  };
}
