/**
 * Store Pinia pour l'administration
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAdminStore = defineStore('admin', () => {
  const pendingPosts = ref([])
  const users = ref([])
  const stats = ref({})
  const loading = ref(false)

  const fetchUsers = async () => {
    // Récupération utilisateurs
  }


  const deleteUser = async (userId) => {
    // Suppression
  }

  const fetchStats = async () => {
    // Récupération statistiques
  }

  return {
    pendingPosts,
    users,
    stats,
    loading,
    fetchPendingPosts,
    approvePost,
    rejectPost,
    fetchUsers,
    suspendUser,
    deleteUser,
    fetchStats
  }
})
