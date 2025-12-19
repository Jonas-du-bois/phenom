/**
 * Service API pour les filtres
 * Endpoints: /filters/*
 */
import apiClient from "../utils/api";

export const filterService = {
  /** GET /filters/countries */
  async getCountries() {
    const response = await apiClient.get("/filters/countries");
    return response.data.data;
  },

  /** GET /filters/locales */
  async getLocales() {
    const response = await apiClient.get("/filters/locales");
    return response.data.data;
  },

  /** GET /filters/observer-types */
  async getObserverTypes() {
    const response = await apiClient.get("/filters/observer-types");
    return response.data.data;
  },

  /** GET /filters/ufo-shapes */
  async getUfoShapes() {
    const response = await apiClient.get("/filters/ufo-shapes");
    return response.data.data;
  },

  /** GET /filters/phenomena */
  async getPhenomena() {
    const response = await apiClient.get("/filters/phenomena");
    return response.data.data;
  },

  /** Récupère tous les filtres en parallèle */
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
