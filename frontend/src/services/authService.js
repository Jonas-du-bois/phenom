/**
 * Service API pour l'authentification
 * Endpoints: /auth/*
 */
import apiClient from "../utils/api";

export const authService = {
  /** POST /auth/login */
  async login(credentials) {
    const response = await apiClient.post("/auth/login", credentials);
    return response.data;
  },

  /** POST /auth/signup */
  async register(userData) {
    const response = await apiClient.post("/auth/signup", userData);
    return response.data;
  },

  /** POST /auth/logout */
  async logout() {
    const response = await apiClient.post("/auth/logout");
    return response.data;
  },

  /** GET /auth/me */
  async getProfile() {
    const response = await apiClient.get("/auth/me");
    return response.data;
  },

  /** POST /auth/forgot-password */
  async forgotPassword(email) {
    const response = await apiClient.post("/auth/forgot-password", { email });
    return response.data;
  },

  /** POST /auth/reset-password */
  async resetPassword(token, password) {
    const response = await apiClient.post("/auth/reset-password", {
      token,
      password,
    });
    return response.data;
  },
};
