/**
 * Notification Pinia Store
 *
 * Manages user notifications/alerts state.
 * Fetches from backend API, handles read/unread status,
 * and provides real-time updates via WebSocket integration.
 */
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useAuthStore } from "./auth";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

export const useNotificationStore = defineStore("notification", () => {
  // ==========================================================================
  // STATE
  // ==========================================================================

  /** List of notifications */
  const notifications = ref([]);

  /** Total count of notifications */
  const total = ref(0);

  /** Count of unread notifications */
  const unreadCount = ref(0);

  /** Loading state */
  const loading = ref(false);

  /** Error message */
  const error = ref(null);

  /** Pagination state */
  const pagination = ref({
    page: 1,
    limit: 50,
    pages: 0,
  });

  /** Last fetch timestamp */
  const lastFetched = ref(null);

  // ==========================================================================
  // COMPUTED
  // ==========================================================================

  /** Sorted notifications (newest first) */
  const sortedNotifications = computed(() => {
    return [...notifications.value].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  });

  /** Unread notifications only */
  const unreadNotifications = computed(() => {
    return notifications.value.filter((n) => !n.read);
  });

  /** Has unread notifications */
  const hasUnread = computed(() => unreadCount.value > 0);

  // ==========================================================================
  // PRIVATE HELPERS
  // ==========================================================================

  const getAuthHeaders = () => {
    const authStore = useAuthStore();
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authStore.token}`,
    };
  };

  // ==========================================================================
  // ACTIONS
  // ==========================================================================

  /**
   * Fetch notifications from API
   * @param {Object} options - { page, limit, unreadOnly, refresh }
   */
  const fetchNotifications = async (options = {}) => {
    const { page = 1, limit = 50, unreadOnly = false, refresh = false } = options;

    // Skip if recently fetched (within 30 seconds) unless forced refresh
    if (
      !refresh &&
      lastFetched.value &&
      Date.now() - lastFetched.value < 30000 &&
      notifications.value.length > 0
    ) {
      return;
    }

    loading.value = true;
    error.value = null;

    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        unreadOnly: String(unreadOnly),
      });

      const response = await fetch(
        `${API_BASE}/api/v1/notifications?${params}`,
        { headers: getAuthHeaders() }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        notifications.value = result.data.notifications || [];
        total.value = result.data.pagination?.total || 0;
        unreadCount.value = result.data.unreadCount || 0;
        pagination.value = result.data.pagination || pagination.value;
        lastFetched.value = Date.now();
      }
    } catch (err) {
      error.value = err.message || "Erreur lors du chargement des notifications";
      console.error("Fetch notifications error:", err);
    } finally {
      loading.value = false;
    }
  };

  /**
   * Fetch only the unread count (lightweight)
   */
  const fetchUnreadCount = async () => {
    try {
      const response = await fetch(
        `${API_BASE}/api/v1/notifications/unread-count`,
        { headers: getAuthHeaders() }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          unreadCount.value = result.data.count || 0;
        }
      }
    } catch (err) {
      console.warn("Failed to fetch unread count:", err);
    }
  };

  /**
   * Mark a single notification as read
   * @param {string} notificationId
   */
  const markAsRead = async (notificationId) => {
    // Optimistic update
    const notification = notifications.value.find((n) => n.id === notificationId);
    if (notification && !notification.read) {
      notification.read = true;
      notification.viewedAt = new Date().toISOString();
      unreadCount.value = Math.max(0, unreadCount.value - 1);
    }

    try {
      const response = await fetch(
        `${API_BASE}/api/v1/notifications/${notificationId}/read`,
        {
          method: "PATCH",
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        // Revert on failure
        if (notification) {
          notification.read = false;
          notification.viewedAt = null;
          unreadCount.value += 1;
        }
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (err) {
      console.error("Mark as read error:", err);
      throw err;
    }
  };

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = async () => {
    // Optimistic update
    const previousUnread = unreadCount.value;
    notifications.value.forEach((n) => {
      if (!n.read) {
        n.read = true;
        n.viewedAt = new Date().toISOString();
      }
    });
    unreadCount.value = 0;

    try {
      const response = await fetch(
        `${API_BASE}/api/v1/notifications/mark-all-read`,
        {
          method: "POST",
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        // Revert on failure
        notifications.value.forEach((n) => {
          if (n.viewedAt) {
            n.read = false;
            n.viewedAt = null;
          }
        });
        unreadCount.value = previousUnread;
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (err) {
      console.error("Mark all as read error:", err);
      throw err;
    }
  };

  /**
   * Delete a single notification
   * @param {string} notificationId
   */
  const deleteNotification = async (notificationId) => {
    const index = notifications.value.findIndex((n) => n.id === notificationId);
    const removed = index >= 0 ? notifications.value.splice(index, 1)[0] : null;

    if (removed && !removed.read) {
      unreadCount.value = Math.max(0, unreadCount.value - 1);
    }
    total.value = Math.max(0, total.value - 1);

    try {
      const response = await fetch(
        `${API_BASE}/api/v1/notifications/${notificationId}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        // Revert on failure
        if (removed && index >= 0) {
          notifications.value.splice(index, 0, removed);
          if (!removed.read) unreadCount.value += 1;
          total.value += 1;
        }
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (err) {
      console.error("Delete notification error:", err);
      throw err;
    }
  };

  /**
   * Delete all read notifications
   */
  const deleteAllRead = async () => {
    const previousNotifications = [...notifications.value];
    const readCount = notifications.value.filter((n) => n.read).length;

    notifications.value = notifications.value.filter((n) => !n.read);
    total.value = Math.max(0, total.value - readCount);

    try {
      const response = await fetch(
        `${API_BASE}/api/v1/notifications/read`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        // Revert on failure
        notifications.value = previousNotifications;
        total.value += readCount;
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (err) {
      console.error("Delete all read error:", err);
      throw err;
    }
  };

  /**
   * Add a new notification from WebSocket event
   * Only adds if not already present (deduplication)
   * @param {Object} notification
   */
  const addFromWebSocket = (notification) => {
    // Check if already exists
    const exists = notifications.value.some(
      (n) => n.id === notification.id || n.id === notification._id
    );

    if (!exists) {
      const normalized = {
        id: notification.id || notification._id,
        type: notification.type || "observation_nearby",
        title: notification.title,
        message: notification.message,
        distance: notification.distance,
        read: false,
        viewedAt: null,
        createdAt: notification.createdAt || new Date().toISOString(),
        observation: notification.observation,
      };

      notifications.value.unshift(normalized);
      unreadCount.value += 1;
      total.value += 1;
    }
  };

  /**
   * Clear all notifications (for logout)
   */
  const clear = () => {
    notifications.value = [];
    total.value = 0;
    unreadCount.value = 0;
    lastFetched.value = null;
    error.value = null;
  };

  /**
   * Force refresh notifications
   */
  const refresh = () => fetchNotifications({ refresh: true });

  return {
    // State
    notifications,
    total,
    unreadCount,
    loading,
    error,
    pagination,
    lastFetched,

    // Computed
    sortedNotifications,
    unreadNotifications,
    hasUnread,

    // Actions
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead,
    addFromWebSocket,
    clear,
    refresh,
  };
});
