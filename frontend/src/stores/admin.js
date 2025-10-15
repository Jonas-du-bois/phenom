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

  const fetchPendingPosts = async () => {
    // Récupération posts en attente
  }

  const approvePost = async (postId) => {
    // Approbation
  }

  const rejectPost = async (postId) => {
    // Rejet
  }

  const fetchUsers = async () => {
    // Récupération utilisateurs
  }

  const suspendUser = async (userId) => {
    // Suspension
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
