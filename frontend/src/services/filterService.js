/**
 * Filter API Service
 *
 * Fetches filter metadata for observation search.
 * Endpoints: /filters/*
 *
 * These endpoints return the available options for
 * filtering observations (countries, locales, etc.).
 */
import apiClient from "../utils/api";

export const filterService = {
  /**
   * Get list of available countries
   * GET /filters/countries
   * @returns {Promise<Array<string>>} Country names
   */
  async getCountries() {
    const response = await apiClient.get("/filters/countries");
    return response.data.data;
  },

  /**
   * Get list of available locale types
   * GET /filters/locales
   * @returns {Promise<Array<string>>} Locale type codes
   */
  async getLocales() {
    const response = await apiClient.get("/filters/locales");
    return response.data.data;
  },

  /**
   * Get list of observer types
   * GET /filters/observer-types
   * @returns {Promise<Array<string>>} Observer type codes
   */
  async getObserverTypes() {
    const response = await apiClient.get("/filters/observer-types");
    return response.data.data;
  },

  /**
   * Get list of UFO shapes
   * GET /filters/ufo-shapes
   * @returns {Promise<Array<string>>} Shape codes
   */
  async getUfoShapes() {
    const response = await apiClient.get("/filters/ufo-shapes");
    return response.data.data;
  },

  /**
   * Get list of phenomena types
   * GET /filters/phenomena
   * @returns {Promise<Array<string>>} Phenomenon codes
   */
  async getPhenomena() {
    const response = await apiClient.get("/filters/phenomena");
    return response.data.data;
  },

  /**
   * Fetch all filter options in parallel
   * Convenience method for initial load
   * @returns {Promise<Object>} All filter options combined
   */
  async getAllFilters() {
    const [countries, locales, observerTypes, ufoShapes, phenomena] =
      await Promise.all([
        this.getCountries(),
        this.getLocales(),
        this.getObserverTypes(),
        this.getUfoShapes(),
        this.getPhenomena(),
      ]);
    return { countries, locales, observerTypes, ufoShapes, phenomena };
  },
};
