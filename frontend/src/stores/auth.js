/**
 * Store Pinia pour l'authentification
 */
import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useAuthStore = defineStore("auth", () => {
  const user = ref(null);
  const token = ref(localStorage.getItem("token"));
  const isAuthenticated = computed(() => !!token.value);
  const isAdmin = computed(() => user.value?.role === "admin");

  const login = async (credentials) => {
    // Logique de login
  };

  const logout = () => {
    // Logique de logout
  };

  const register = async (userData) => {
    // Logique de register
  };

  const fetchUser = async () => {
    // Récupération profil utilisateur
  };

  return {
    user,
    token,
    isAuthenticated,
    isAdmin,
    login,
    logout,
    register,
    fetchUser,
  };
});
