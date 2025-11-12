/**
 * Store Pinia pour les commentaires
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCommentStore = defineStore('comment', () => {
  const comments = ref({}) // Commentaires par observation ID
  const loading = ref(false)

  const fetchComments = async (observationId) => {
    // Récupération des commentaires
  }

  const addComment = async (observationId, text) => {
    // Ajout de commentaire
  }

  const changeComment = async (commentId, newText) => {
    // Changement de commentaire
  }

  const deleteComment = async (commentId) => {
    // Suppression de commentaire
  }

  return {
    comments,
    loading,
    fetchComments,
    addComment,
    deleteComment,
    changeComment
  }
})
