/**
 * User Profile Pinia Store
 *
 * Simple wrapper around the user service for profile management.
 * Handles fetching, updating profile, avatar, password, and account deletion.
 *
 * @module stores/user
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
      error.value = err.response?.data?.message || "Failed to load profile";
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
      error.value = err.response?.data?.message || "Failed to update profile";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateAvatar = async (file) => {
    loading.value = true;
    error.value = null;
    try {
      // Service handles FormData
      const response = await userService.updateAvatar(file);
      // response is the backend payload (axios response.data), try several shapes
      // Backend typically returns: { success: true, data: { url, publicId } }
      const avatarObj = response?.data || response || response?.avatar || null;
      if (profile.value) {
        profile.value.avatar = avatarObj;
      }
      return profile.value;
    } catch (err) {
      error.value = err.response?.data?.message || "Failed to upload avatar";
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
      error.value = err.response?.data?.message || "Failed to change password";
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
      error.value = err.response?.data?.message || "Failed to delete account";
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
