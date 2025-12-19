/**
 * Composable pour la gestion de l'authentification
 * KISS: Simple, focus sur les actions essentielles
 */
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { authService } from "../services/authService";

const user = ref(null);
const token = ref(localStorage.getItem("token") || null);
const loading = ref(false);
const error = ref(null);

export function useAuth() {
  const router = useRouter();

  // État
  const isAuthenticated = computed(() => !!token.value && !!user.value);
  const isAdmin = computed(() => user.value?.role === "admin");

  /**
   * Connexion
   */
  const login = async (email, password) => {
    try {
      loading.value = true;
      error.value = null;

      const response = await authService.login({ email, password });

      console.log("🔍 Response complète:", response);
      console.log("🔍 response.data:", response.data);

      // authService retourne response.data du backend: { success: true, data: { user, accessToken } }
      // Note: le refreshToken est maintenant stocké dans un cookie HttpOnly (non accessible en JS)
      const { user: userData, accessToken } = response.data;

      console.log("🔍 userData:", userData);
      console.log("🔍 accessToken:", accessToken);

      token.value = accessToken;
      user.value = userData;

      localStorage.setItem("token", accessToken);
      localStorage.setItem("user", JSON.stringify(userData));

      return true;
    } catch (err) {
      console.error("❌ Erreur login:", err);
      error.value = err.response?.data?.message || "Erreur de connexion";
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Inscription
   */
  const register = async (name, email, password) => {
    try {
      loading.value = true;
      error.value = null;

      const response = await authService.register({ name, email, password });

      // authService retourne response.data: { success: true, data: { user, accessToken } }
      // Note: le refreshToken est maintenant stocké dans un cookie HttpOnly (non accessible en JS)
      const { user: userData, accessToken } = response.data;

      token.value = accessToken;
      user.value = userData;

      localStorage.setItem("token", accessToken);
      localStorage.setItem("user", JSON.stringify(userData));

      return true;
    } catch (err) {
      console.error("❌ Erreur register:", err);
      error.value = err.response?.data?.message || "Erreur d'inscription";
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Déconnexion
   */
  const logout = async () => {
    try {
      // Appeler le backend pour invalider le token
      await authService.logout();
    } catch (error) {
      console.error("❌ Erreur lors de la déconnexion:", error);
      // Continuer quand même avec la déconnexion locale
    } finally {
      // Nettoyer le state local
      token.value = null;
      user.value = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Redirection vers la page d'authentification
      router.push("/auth");
    }
  };

  /**
   * Charger le profil utilisateur
   */
  const loadProfile = async () => {
    try {
      loading.value = true;
      const response = await authService.getProfile();
      // Backend retourne: { success: true, data: { user } }
      user.value = response.data;
      localStorage.setItem("user", JSON.stringify(user.value));
    } catch (err) {
      console.error("Erreur de chargement du profil:", err);
      // Si le token est invalide, déconnecter
      if (err.response?.status === 401) {
        logout();
      }
    } finally {
      loading.value = false;
    }
  };

  /**
   * Initialiser depuis localStorage
   */
  const init = () => {
    const savedUser = localStorage.getItem("user");
    if (savedUser && token.value) {
      try {
        user.value = JSON.parse(savedUser);
      } catch (e) {
        console.error("Erreur parsing user:", e);
        logout();
      }
    }
  };

  // Auto-init
  if (!user.value && token.value) {
    init();
  }

  return {
    // État
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
