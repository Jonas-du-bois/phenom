/**
 * Store Pinia pour les utilisateurs
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { userService } from '../services/userService'

export const useUserStore = defineStore('user', () => {
  const profile = ref(null)
  const loading = ref(false)
  const error = ref(null)

  /**
   * Récupère le profil utilisateur
   */
  async function fetchProfile() {
    loading.value = true
    error.value = null
    try {
      const response = await userService.getMe()
      profile.value = response.data
      return response
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de la récupération du profil'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Met à jour le profil
   */
  async function updateProfile(userData) {
    loading.value = true
    error.value = null
    try {
      const response = await userService.updateMe(userData)
      profile.value = response.data
      return response
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de la mise à jour du profil'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Met à jour l'avatar
   */
  async function updateAvatar(file) {
    loading.value = true
    error.value = null
    try {
      const formData = new FormData()
      formData.append('avatar', file)
      const response = await userService.updateAvatar(formData)
      profile.value = response.data
      return response
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de la mise à jour de l\'avatar'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Change le mot de passe
   */
  async function changePassword(passwordData) {
    loading.value = true
    error.value = null
    try {
      const response = await userService.changePassword(passwordData)
      return response
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors du changement de mot de passe'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Supprime le compte
   */
  async function deleteAccount() {
    loading.value = true
    error.value = null
    try {
      const response = await userService.deleteAccount()
      profile.value = null
      return response
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de la suppression du compte'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Réinitialise le store
   */
  function $reset() {
    profile.value = null
    loading.value = false
    error.value = null
  }

  return {
    profile,
    loading,
    error,
    fetchProfile,
    updateProfile,
    updateAvatar,
    changePassword,
    deleteAccount,
    $reset
  }
})
