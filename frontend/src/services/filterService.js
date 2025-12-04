/**
 * Service API pour les filtres
 * Compatible avec le format Phenom Search API
 */
import apiClient from '../utils/api';

export const filterService = {
  /**
   * Récupère la liste des pays disponibles
   * GET /filters/countries
   * @returns {Promise<string[]>}
   */
  async getCountries() {
    const response = await apiClient.get('/filters/countries');
    return response.data.data;
  },

  /**
   * Récupère la liste des types de localités
   * GET /filters/locales
   * @returns {Promise<string[]>}
   */
  async getLocales() {
    const response = await apiClient.get('/filters/locales');
    return response.data.data;
  },

  /**
   * Récupère la liste des types d'observateurs
   * GET /filters/observer-types
   * @returns {Promise<Array<{code: string, description: string}>>}
   */
  async getObserverTypes() {
    const response = await apiClient.get('/filters/observer-types');
    return response.data.data;
  },

  /**
   * Récupère la liste des formes d'OVNI
   * GET /filters/ufo-shapes
   * @returns {Promise<Array<{code: string, description: string}>>}
   */
  async getUfoShapes() {
    const response = await apiClient.get('/filters/ufo-shapes');
    return response.data.data;
  },

  /**
   * Récupère la liste des phénomènes
   * GET /filters/phenomena
   * @returns {Promise<Array<{code: string, description: string}>>}
   */
  async getPhenomena() {
    const response = await apiClient.get('/filters/phenomena');
    return response.data.data;
  },

  /**
   * Récupère tous les filtres en une seule fois
   * @returns {Promise<Object>}
   */
  async getAllFilters() {
    const [countries, locales, observerTypes, ufoShapes, phenomena] = await Promise.all([
      this.getCountries(),
      this.getLocales(),
      this.getObserverTypes(),
      this.getUfoShapes(),
      this.getPhenomena()
    ]);

    return {
      countries,
      locales,
      observerTypes,
      ufoShapes,
      phenomena
    };
  }
};

export default filterService;
