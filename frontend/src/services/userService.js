import api from '../utils/api'

/**
 * Service pour gérer les opérations liées au profil utilisateur
 */
export const userService = {
  /**
   * Récupère les informations du profil de l'utilisateur connecté
   * @returns {Promise} Profil de l'utilisateur
   */
  async getMe() {
    try {
      const response = await api.get('/users/me')
      return response.data
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error)
      throw error
    }
  },

  /**
   * Met à jour les informations du profil de l'utilisateur
   * @param {Object} userData - Données à mettre à jour (username, bio, etc.)
   * @returns {Promise} Profil mis à jour
   */
  async updateMe(userData) {
    try {
      const response = await api.put('/users/me', userData)
      return response.data
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error)
      throw error
    }
  },

  /**
   * Met à jour l'avatar de l'utilisateur
   * @param {File} file - Fichier image à uploader
   * @returns {Promise} URL de l'avatar mis à jour
   */
  async updateAvatar(file) {
    try {
      const formData = new FormData()
      formData.append('avatar', file)

      const response = await api.put('/users/me/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'avatar:', error)
      throw error
    }
  },

  /**
   * Change le mot de passe de l'utilisateur
   * @param {Object} passwords - { currentPassword, newPassword }
   * @returns {Promise} Message de confirmation
   */
  async changePassword(passwords) {
    try {
      const response = await api.patch('/users/me/password', passwords)
      return response.data
    } catch (error) {
      console.error('Erreur lors du changement de mot de passe:', error)
      throw error
    }
  },

  /**
   * Supprime le compte de l'utilisateur
   * @returns {Promise} Message de confirmation
   */
  async deleteAccount() {
    try {
      const response = await api.delete('/users/me')
      return response.data
    } catch (error) {
      console.error('Erreur lors de la suppression du compte:', error)
      throw error
    }
  }
}

export default userService
