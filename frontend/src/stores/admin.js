/**
 * Admin Store - Pinia Store for Administration
 *
 * KISS: Simple wrapper around the admin service
 * Manages admin-specific state and operations.
 *
 * @module stores/admin
 *
 * State:
 * - users: List of all users
 * - reports: List of pending reports
 * - stats: Platform statistics
 *
 * Actions:
 * - fetchStats: Get admin dashboard statistics
 * - fetchUsers: Get paginated user list
 * - fetchReports: Get pending reports
 * - updateUserRole: Change user role
 * - verifyObservation: Mark observation as verified
 * - deleteObservation: Remove observation (admin)
 * - deleteComment: Remove comment (admin)
 * - dismissReport: Reject a report
 */
import { defineStore } from "pinia";
import { ref } from "vue";
import { adminService } from "../services/adminService";

export const useAdminStore = defineStore("admin", () => {
  // ============================================================================
  // STATE
  // ============================================================================

  const users = ref([]); // User list
  const reports = ref([]); // Pending reports
  const stats = ref({
    users: 0, // Total users count
    observations: 0, // Total observations count
    comments: 0, // Total comments count
    todayObservations: 0, // Observations created today
    pendingReports: 0, // Reports awaiting review
  });
  const loading = ref(false); // Loading state
  const error = ref(null); // Error message

  // ============================================================================
  // ACTIONS
  // ============================================================================

  /**
   * Fetch admin dashboard statistics
   * @returns {Promise<Object>} Stats object
   */
  const fetchStats = async () => {
    loading.value = true;
    try {
      const response = await adminService.getStats();
      stats.value = response.data || response;
      return stats.value;
    } catch (err) {
      error.value = err.response?.data?.message || "Failed to load stats";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Fetch paginated user list
   * @param {Object} params - Query parameters (page, limit, search)
   * @returns {Promise<Array>} User list
   */
  const fetchUsers = async (params = {}) => {
    loading.value = true;
    try {
      const response = await adminService.getUsers(params);
      users.value = response.data || response.users || [];
      return users.value;
    } catch (err) {
      error.value = err.response?.data?.message || "Failed to load users";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Fetch pending reports
   * @returns {Promise<Array>} Report list
   */
  const fetchReports = async () => {
    loading.value = true;
    try {
      const response = await adminService.getReports();
      reports.value = response.data || response.reports || [];
      return reports.value;
    } catch (err) {
      error.value = err.response?.data?.message || "Failed to load reports";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Update a user's role
   * @param {string} userId - User ID
   * @param {string} role - New role ('admin' or 'viewer')
   */
  const updateUserRole = async (userId, role) => {
    loading.value = true;
    try {
      await adminService.updateUserRole(userId, role);
      const index = users.value.findIndex((u) => u._id === userId);
      if (index !== -1) users.value[index].role = role;
    } catch (err) {
      error.value = err.response?.data?.message || "Failed to update role";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Mark an observation as verified
   * @param {string} observationId - Observation ID
   */
  const verifyObservation = async (observationId) => {
    loading.value = true;
    try {
      await adminService.verifyObservation(observationId);
    } catch (err) {
      error.value =
        err.response?.data?.message || "Failed to verify observation";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Delete an observation (admin only)
   * @param {string} observationId - Observation ID
   */
  const deleteObservation = async (observationId) => {
    loading.value = true;
    try {
      await adminService.deleteObservation(observationId);
    } catch (err) {
      error.value =
        err.response?.data?.message || "Failed to delete observation";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Delete a comment (admin only)
   * @param {string} commentId - Comment ID
   */
  const deleteComment = async (commentId) => {
    loading.value = true;
    try {
      await adminService.deleteComment(commentId);
    } catch (err) {
      error.value = err.response?.data?.message || "Failed to delete comment";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Dismiss/reject a report
   * @param {string} reportId - Report ID
   */
  const dismissReport = async (reportId) => {
    loading.value = true;
    try {
      await adminService.dismissReport(reportId);
      reports.value = reports.value.filter((r) => (r._id || r.id) !== reportId);
    } catch (err) {
      error.value = err.response?.data?.message || "Failed to dismiss report";
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
