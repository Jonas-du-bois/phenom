/**
 * Store Pinia pour le profil utilisateur
 * KISS: Wrapper simple autour du service
 */
import { defineStore } from "pinia";
import { ref } from "vue";
import { userService } from "../services/userService";

export const useUserStore = defineStore("user", () => {
  const profile = ref(null);
  const loading = ref(false);
  const error = ref(null);

  const fetchProfile = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await userService.getMe();
      profile.value = response.data || response;
      return profile.value;
    } catch (err) {
      error.value = err.response?.data?.message || "Erreur de chargement";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateProfile = async (data) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await userService.updateMe(data);
      profile.value = response.data || response;
      return profile.value;
    } catch (err) {
      error.value = err.response?.data?.message || "Erreur de mise à jour";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateAvatar = async (file) => {
    loading.value = true;
    error.value = null;
    try {
      // Le service gère le FormData
      const response = await userService.updateAvatar(file);
      // response is the backend payload (axios response.data), try several shapes
      // Backend typically returns: { success: true, data: { url, publicId } }
      const avatarObj = response?.data || response || response?.avatar || null;
      if (profile.value) {
        profile.value.avatar = avatarObj;
      }
      return profile.value;
    } catch (err) {
      error.value = err.response?.data?.message || "Erreur upload avatar";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const changePassword = async (passwords) => {
    loading.value = true;
    error.value = null;
    try {
      await userService.changePassword(passwords);
    } catch (err) {
      error.value =
        err.response?.data?.message || "Erreur changement mot de passe";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteAccount = async () => {
    loading.value = true;
    try {
      await userService.deleteAccount();
      profile.value = null;
    } catch (err) {
      error.value = err.response?.data?.message || "Erreur suppression compte";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const $reset = () => {
    profile.value = null;
    loading.value = false;
    error.value = null;
  };

  return {
    profile,
    loading,
    error,
    fetchProfile,
    updateProfile,
    updateAvatar,
    changePassword,
    deleteAccount,
    $reset,
  };
});
