/**
 * Configuration et wrapper pour les appels API
 */
import axios from 'axios'

// Construire l'URL complète de l'API
// VITE_API_BASE_URL = https://phenom-backend.onrender.com
// VITE_API_PREFIX = /api/v1
// Résultat = https://phenom-backend.onrender.com/api/v1
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL //|| 'http://localhost:3000'
const API_PREFIX = import.meta.env.VITE_API_PREFIX //|| '/api/v1'
const API_URL = `${API_BASE_URL}${API_PREFIX}`

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Intercepteur pour ajouter le token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
    console.log('🔑 Token ajouté à la requête:', config.url)
  } else {
    console.warn('⚠️ Aucun token trouvé pour:', config.url)
  }
  return config
})

// Intercepteur pour gérer les erreurs
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Gestion des erreurs globales
    return Promise.reject(error)
  }
)

export default apiClient
