/**
 * Store Pinia pour l'administration
 * KISS: Wrapper simple autour du service admin
 */
import { defineStore } from "pinia";
import { ref } from "vue";
import { adminService } from "../services/adminService";

export const useAdminStore = defineStore("admin", () => {
  const users = ref([]);
  const reports = ref([]);
  const stats = ref({
    users: 0,
    observations: 0,
    comments: 0,
    todayObservations: 0,
    pendingReports: 0,
  });
  const loading = ref(false);
  const error = ref(null);

  /**
   * Récupère les statistiques admin
   */
  const fetchStats = async () => {
    loading.value = true;
    try {
      const response = await adminService.getStats();
      stats.value = response.data || response;
      return stats.value;
    } catch (err) {
      error.value = err.response?.data?.message || "Erreur de chargement";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Récupère la liste des utilisateurs
   */
  const fetchUsers = async (params = {}) => {
    loading.value = true;
    try {
      const response = await adminService.getUsers(params);
      users.value = response.data || response.users || [];
      return users.value;
    } catch (err) {
      error.value = err.response?.data?.message || "Erreur de chargement";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Récupère les signalements
   */
  const fetchReports = async () => {
    loading.value = true;
    try {
      const response = await adminService.getReports();
      reports.value = response.data || response.reports || [];
      return reports.value;
    } catch (err) {
      error.value = err.response?.data?.message || "Erreur de chargement";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Modifie le rôle d'un utilisateur
   */
  const updateUserRole = async (userId, role) => {
    loading.value = true;
    try {
      await adminService.updateUserRole(userId, role);
      const index = users.value.findIndex((u) => u._id === userId);
      if (index !== -1) users.value[index].role = role;
    } catch (err) {
      error.value = err.response?.data?.message || "Erreur de mise à jour";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Vérifie une observation
   */
  const verifyObservation = async (observationId) => {
    loading.value = true;
    try {
      await adminService.verifyObservation(observationId);
    } catch (err) {
      error.value = err.response?.data?.message || "Erreur de vérification";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Supprime une observation (admin)
   */
  const deleteObservation = async (observationId) => {
    loading.value = true;
    try {
      await adminService.deleteObservation(observationId);
    } catch (err) {
      error.value = err.response?.data?.message || "Erreur de suppression";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Supprime un commentaire (admin)
   */
  const deleteComment = async (commentId) => {
    loading.value = true;
    try {
      await adminService.deleteComment(commentId);
    } catch (err) {
      error.value = err.response?.data?.message || "Erreur de suppression";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Rejette un signalement
   */
  const dismissReport = async (reportId) => {
    loading.value = true;
    try {
      await adminService.dismissReport(reportId);
      reports.value = reports.value.filter((r) => (r._id || r.id) !== reportId);
    } catch (err) {
      error.value = err.response?.data?.message || "Erreur de rejet";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    users,
    reports,
    stats,
    loading,
    error,
    fetchStats,
    fetchUsers,
    fetchReports,
    updateUserRole,
    verifyObservation,
    deleteObservation,
    deleteComment,
    dismissReport,
  };
});
