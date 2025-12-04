/**
 * Service API pour les observations/sightings
 * Compatible avec le format Phenom Search API
 */
import apiClient from '../utils/api';

/**
 * Helper: Construit les paramètres en excluant les valeurs null/undefined
 * @param {Object} filters - Objet de filtres
 * @returns {Object} - Paramètres nettoyés
 */
const buildParams = (filters) => {
  const params = {};
  
  // Champs simples à copier directement
  const simpleFields = [
    'country', 'locale', 'search', 'startYear', 'endYear',
    'minCredibility', 'maxCredibility', 'minStrangeness', 'maxStrangeness',
    'minDuration', 'maxDuration', 'hasCoordinates', 'hasImages',
    'limit', 'offset', 'page', 'perPage'
  ];
  
  simpleFields.forEach(field => {
    if (filters[field] !== undefined && filters[field] !== null && filters[field] !== '') {
      params[field] = filters[field];
    }
  });
  
  // Champs arrays (comma-separated)
  const arrayFields = ['observerType', 'ufoShape', 'phenomenon'];
  arrayFields.forEach(field => {
    if (filters[field]) {
      params[field] = Array.isArray(filters[field]) 
        ? filters[field].join(',') 
        : filters[field];
    }
  });
  
  return params;
};

export const sightingService = {
  // ============================================
  // PHENOM SEARCH COMPATIBLE ENDPOINTS (Public)
  // ============================================

  /**
   * Récupère les observations avec pagination simple
   * GET /sightings/paginated
   */
  async getPaginated({ page = 1, perPage = 50 } = {}) {
    const response = await apiClient.get('/sightings/paginated', {
      params: { page, perPage }
    });
    return response.data;
  },

  /**
   * Récupère les observations avec filtres avancés
   * GET /sightings
   */
  async getWithFilters(filters = {}) {
    const response = await apiClient.get('/sightings', { 
      params: buildParams(filters) 
    });
    return response.data;
  },

  /**
   * Récupère une observation par son ID
   * GET /sightings/:id
   */
  async getById(id) {
    const response = await apiClient.get(`/sightings/${id}`);
    return response.data;
  },

  // ============================================
  // CRUD OPERATIONS (Authenticated)
  // ============================================

  async create(sightingData) {
    const response = await apiClient.post('/observations', sightingData);
    return response.data;
  },

  async update(id, sightingData) {
    const response = await apiClient.put(`/observations/${id}`, sightingData);
    return response.data;
  },

  async delete(id) {
    const response = await apiClient.delete(`/observations/${id}`);
    return response.data;
  },

  // ============================================
  // IMAGES
  // ============================================

  async addImages(observationId, formData) {
    const response = await apiClient.post(
      `/observations/${observationId}/images`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },

  async generateAiImage(observationId) {
    const response = await apiClient.post(`/observations/${observationId}/generate-ai-image`);
    return response.data;
  },

  // ============================================
  // NEARBY SEARCH
  // ============================================

  async getNearby({ lat, lng, radius = 10, limit = 50 } = {}) {
    const response = await apiClient.get('/observations/nearby', {
      params: { latitude: lat, longitude: lng, radius, limit }
    });
    return response.data;
  }
};

export default sightingService;
