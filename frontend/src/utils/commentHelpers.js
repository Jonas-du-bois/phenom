/**
 * Utilitaires pour la gestion et manipulation des commentaires
 */

/**
 * Trie les commentaires
 * @param {Array} comments - Liste des commentaires
 * @param {string} order - 'asc' (plus anciens d'abord) ou 'desc' (plus récents d'abord)
 * @returns {Array} Commentaires triés
 */
export const sortComments = (comments, order = 'desc') => {
  return [...comments].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime()
    const dateB = new Date(b.createdAt).getTime()
    return order === 'asc' ? dateA - dateB : dateB - dateA
  })
}

/**
 * Filtre les commentaires par utilisateur
 * @param {Array} comments - Liste des commentaires
 * @param {string} userId - ID de l'utilisateur
 * @returns {Array} Commentaires de l'utilisateur
 */
export const filterCommentsByUser = (comments, userId) => {
  if (!userId) return comments
  return comments.filter(comment => {
    const commentUserId = comment.userId?._id || comment.userId
    return commentUserId === userId
  })
}

/**
 * Filtre les commentaires par période de temps
 * @param {Array} comments - Liste des commentaires
 * @param {Date} startDate - Date de début
 * @param {Date} endDate - Date de fin
 * @returns {Array} Commentaires filtrés
 */
export const filterCommentsByDate = (comments, startDate, endDate) => {
  return comments.filter(comment => {
    const commentDate = new Date(comment.createdAt)
    const start = startDate ? new Date(startDate) : new Date(0)
    const end = endDate ? new Date(endDate) : new Date()
    return commentDate >= start && commentDate <= end
  })
}

/**
 * Recherche dans les commentaires
 * @param {Array} comments - Liste des commentaires
 * @param {string} searchText - Texte à rechercher
 * @returns {Array} Commentaires correspondants
 */
export const searchComments = (comments, searchText) => {
  if (!searchText || searchText.trim() === '') return comments
  
  const search = searchText.toLowerCase().trim()
  return comments.filter(comment => {
    const content = (comment.content || '').toLowerCase()
    const userName = (comment.userId?.name || '').toLowerCase()
    return content.includes(search) || userName.includes(search)
  })
}

/**
 * Groupe les commentaires par utilisateur
 * @param {Array} comments - Liste des commentaires
 * @returns {Object} Commentaires groupés par userId
 */
export const groupCommentsByUser = (comments) => {
  return comments.reduce((acc, comment) => {
    const userId = comment.userId?._id || comment.userId
    if (!acc[userId]) acc[userId] = []
    acc[userId].push(comment)
    return acc
  }, {})
}

/**
 * Groupe les commentaires par date (jour)
 * @param {Array} comments - Liste des commentaires
 * @returns {Object} Commentaires groupés par date
 */
export const groupCommentsByDate = (comments) => {
  return comments.reduce((acc, comment) => {
    const date = new Date(comment.createdAt)
    const dateKey = date.toISOString().split('T')[0]
    if (!acc[dateKey]) acc[dateKey] = []
    acc[dateKey].push(comment)
    return acc
  }, {})
}

/**
 * Compte le nombre de commentaires par observation
 * @param {Array} comments - Liste des commentaires
 * @returns {Object} { observationId: count }
 */
export const countCommentsByObservation = (comments) => {
  return comments.reduce((acc, comment) => {
    const obsId = comment.observationId
    acc[obsId] = (acc[obsId] || 0) + 1
    return acc
  }, {})
}

/**
 * Calcule des statistiques sur les commentaires
 * @param {Array} comments - Liste des commentaires
 * @returns {Object} Statistiques
 */
export const calculateCommentStats = (comments) => {
  const stats = {
    total: comments.length,
    byUser: {},
    avgLength: 0,
    dateRange: { oldest: null, newest: null }
  }
  
  if (comments.length === 0) return stats
  
  // Stats par utilisateur
  comments.forEach(comment => {
    const userId = comment.userId?._id || comment.userId
    const userName = comment.userId?.name || 'Anonyme'
    if (!stats.byUser[userId]) {
      stats.byUser[userId] = { name: userName, count: 0 }
    }
    stats.byUser[userId].count++
  })
  
  // Longueur moyenne
  const totalLength = comments.reduce((sum, comment) => 
    sum + (comment.content?.length || 0), 0
  )
  stats.avgLength = Math.round(totalLength / comments.length)
  
  // Date range
  const dates = comments.map(c => new Date(c.createdAt).getTime())
  stats.dateRange.oldest = new Date(Math.min(...dates))
  stats.dateRange.newest = new Date(Math.max(...dates))
  
  return stats
}

/**
 * Valide les données d'un commentaire
 * @param {Object} commentData - Données du commentaire
 * @returns {Object} { valid: boolean, errors: Array<string> }
 */
export const validateCommentData = (commentData) => {
  const errors = []
  
  if (!commentData.content || commentData.content.trim().length === 0) {
    errors.push('Le commentaire ne peut pas être vide')
  }
  
  if (commentData.content && commentData.content.length > 1000) {
    errors.push('Le commentaire ne peut pas dépasser 1000 caractères')
  }
  
  if (!commentData.observationId) {
    errors.push('L\'ID de l\'observation est requis')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Formate un commentaire pour l'affichage
 * @param {Object} comment - Commentaire à formater
 * @returns {Object} Commentaire formaté
 */
export const formatCommentForDisplay = (comment) => {
  if (!comment) return null
  
  return {
    id: comment._id || comment.id,
    content: comment.content,
    author: {
      id: comment.userId?._id || comment.userId,
      name: comment.userId?.name || 'Utilisateur supprimé',
      email: comment.userId?.email
    },
    observationId: comment.observationId,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    isRecent: isRecentComment(comment)
  }
}

/**
 * Vérifie si un commentaire est récent (moins de 24h)
 * @param {Object} comment - Commentaire à vérifier
 * @returns {boolean}
 */
export const isRecentComment = (comment) => {
  const commentDate = new Date(comment.createdAt)
  const now = new Date()
  const diffHours = (now - commentDate) / (1000 * 60 * 60)
  return diffHours < 24
}

/**
 * Nettoie le contenu d'un commentaire
 * @param {string} content - Contenu du commentaire
 * @returns {string} Contenu nettoyé
 */
export const sanitizeCommentContent = (content) => {
  return content
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Supprime les scripts
    .replace(/<[^>]*>/g, '') // Supprime les balises HTML
    .slice(0, 1000) // Limite à 1000 caractères
}

/**
 * Trouve les utilisateurs les plus actifs en commentaires
 * @param {Array} comments - Liste des commentaires
 * @param {number} limit - Nombre de résultats
 * @returns {Array} Top utilisateurs avec leur nombre de commentaires
 */
export const getTopCommenters = (comments, limit = 5) => {
  const userCounts = {}
  
  comments.forEach(comment => {
    const userId = comment.userId?._id || comment.userId
    const userName = comment.userId?.name || 'Anonyme'
    
    if (!userCounts[userId]) {
      userCounts[userId] = { userId, userName, count: 0 }
    }
    userCounts[userId].count++
  })
  
  return Object.values(userCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}
