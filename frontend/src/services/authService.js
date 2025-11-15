/**
 * Services API pour l'authentification
 */
import apiClient from '../utils/api'

export const authService = {
  /**
   * Connexion
   */
  async login(credentials) {
    const response = await apiClient.post('/auth/login', credentials)
    return response.data
  },

  /**
   * Inscription
   */
  async register(userData) {
    const response = await apiClient.post('/auth/signup', userData)
    return response.data
  },

  /**
   * Déconnexion
   */
  async logout() {
    const response = await apiClient.post('/auth/logout')
    return response.data
  },

  /**
   * Récupère le profil utilisateur
   */
  async getProfile() {
    const response = await apiClient.get('/auth/me')
    return response.data
  },

  /**
   * Réinitialisation du mot de passe
   */
  async forgotPassword(email) {
    const response = await apiClient.post('/auth/forgot-password', { email })
    return response.data
  }
}
