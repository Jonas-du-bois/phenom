/**
 * Service API pour les utilisateurs
 * Endpoints: /users/*
 */
import api from "../utils/api";

export const userService = {
  /** GET /users/me */
  async getMe() {
    const response = await api.get("/users/me");
    return response.data;
  },

  /** GET /users/:id */
  async getById(userId) {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  /** PUT /users/me */
  async updateMe(data) {
    const response = await api.put("/users/me", data);
    return response.data;
  },

  /** PUT /users/me/avatar (multipart) */
  async updateAvatar(file) {
    const formData = new FormData();
    formData.append("avatar", file);
    const response = await api.put("/users/me/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return response.data;
  },

  /** PATCH /users/me/password */
  async changePassword(passwords) {
    const response = await api.patch("/users/me/password", passwords);
    return response.data;
  },

  /** DELETE /users/me */
  async deleteAccount() {
    const response = await api.delete("/users/me");
    return response.data;
  },

  /** GET /users/me/stats */
  async getUserStats() {
    const response = await api.get("/users/me/stats");
    return response.data;
  },
};
