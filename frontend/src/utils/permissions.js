/**
 * Utilitaires de permission et d'autorisation
 */

/**
 * Rôles disponibles dans l'application
 */
export const ROLES = {
  ADMIN: 'admin',
  VIEWER: 'viewer'
}

/**
 * Permissions par rôle
 */
export const PERMISSIONS = {
  // Observations
  CREATE_OBSERVATION: [ROLES.ADMIN, ROLES.VIEWER],
  EDIT_OWN_OBSERVATION: [ROLES.ADMIN, ROLES.VIEWER],
  EDIT_ANY_OBSERVATION: [ROLES.ADMIN],
  DELETE_OWN_OBSERVATION: [ROLES.ADMIN, ROLES.VIEWER],
  DELETE_ANY_OBSERVATION: [ROLES.ADMIN],
  VIEW_OBSERVATIONS: [ROLES.ADMIN, ROLES.VIEWER],
  
  // Commentaires
  CREATE_COMMENT: [ROLES.ADMIN, ROLES.VIEWER],
  EDIT_OWN_COMMENT: [ROLES.ADMIN, ROLES.VIEWER],
  EDIT_ANY_COMMENT: [ROLES.ADMIN],
  DELETE_OWN_COMMENT: [ROLES.ADMIN, ROLES.VIEWER],
  DELETE_ANY_COMMENT: [ROLES.ADMIN],
  
  // Utilisateurs
  VIEW_USERS: [ROLES.ADMIN],
  CREATE_USER: [ROLES.ADMIN],
  EDIT_USER: [ROLES.ADMIN],
  DELETE_USER: [ROLES.ADMIN],
  CHANGE_USER_ROLE: [ROLES.ADMIN],
  
  // Administration
  ACCESS_ADMIN_PANEL: [ROLES.ADMIN],
  VIEW_STATS: [ROLES.ADMIN],
  MANAGE_SYSTEM: [ROLES.ADMIN]
}

/**
 * Vérifie si un utilisateur a un rôle spécifique
 * @param {Object} user - Objet utilisateur
 * @param {string} role - Rôle à vérifier
 * @returns {boolean}
 */
export const hasRole = (user, role) => {
  return user?.role === role
}

/**
 * Vérifie si un utilisateur a une permission
 * @param {Object} user - Objet utilisateur
 * @param {string} permission - Permission à vérifier (ex: 'CREATE_OBSERVATION')
 * @returns {boolean}
 */
export const hasPermission = (user, permission) => {
  if (!user || !user.role) return false
  const allowedRoles = PERMISSIONS[permission]
  return allowedRoles ? allowedRoles.includes(user.role) : false
}

/**
 * Vérifie si un utilisateur peut créer une observation
 * @param {Object} user - Objet utilisateur
 * @returns {boolean}
 */
export const canCreateObservation = (user) => {
  return hasPermission(user, 'CREATE_OBSERVATION')
}

/**
 * Vérifie si un utilisateur peut éditer une observation
 * @param {Object} user - Objet utilisateur
 * @param {Object} observation - Observation à éditer
 * @returns {boolean}
 */
export const canEditObservation = (user, observation) => {
  if (!user || !observation) return false
  
  // Admin peut tout éditer
  if (hasPermission(user, 'EDIT_ANY_OBSERVATION')) return true
  
  // Utilisateur peut éditer ses propres observations
  if (hasPermission(user, 'EDIT_OWN_OBSERVATION')) {
    const userId = user._id || user.id
    const obsUserId = observation.userId?._id || observation.userId
    return userId === obsUserId
  }
  
  return false
}

/**
 * Vérifie si un utilisateur peut supprimer une observation
 * @param {Object} user - Objet utilisateur
 * @param {Object} observation - Observation à supprimer
 * @returns {boolean}
 */
export const canDeleteObservation = (user, observation) => {
  if (!user || !observation) return false
  
  // Admin peut tout supprimer
  if (hasPermission(user, 'DELETE_ANY_OBSERVATION')) return true
  
  // Utilisateur peut supprimer ses propres observations
  if (hasPermission(user, 'DELETE_OWN_OBSERVATION')) {
    const userId = user._id || user.id
    const obsUserId = observation.userId?._id || observation.userId
    return userId === obsUserId
  }
  
  return false
}

/**
 * Vérifie si un utilisateur peut créer un commentaire
 * @param {Object} user - Objet utilisateur
 * @returns {boolean}
 */
export const canCreateComment = (user) => {
  return hasPermission(user, 'CREATE_COMMENT')
}

/**
 * Vérifie si un utilisateur peut éditer un commentaire
 * @param {Object} user - Objet utilisateur
 * @param {Object} comment - Commentaire à éditer
 * @returns {boolean}
 */
export const canEditComment = (user, comment) => {
  if (!user || !comment) return false
  
  // Admin peut tout éditer
  if (hasPermission(user, 'EDIT_ANY_COMMENT')) return true
  
  // Utilisateur peut éditer ses propres commentaires
  if (hasPermission(user, 'EDIT_OWN_COMMENT')) {
    const userId = user._id || user.id
    const commentUserId = comment.userId?._id || comment.userId
    return userId === commentUserId
  }
  
  return false
}

/**
 * Vérifie si un utilisateur peut supprimer un commentaire
 * @param {Object} user - Objet utilisateur
 * @param {Object} comment - Commentaire à supprimer
 * @returns {boolean}
 */
export const canDeleteComment = (user, comment) => {
  if (!user || !comment) return false
  
  // Admin peut tout supprimer
  if (hasPermission(user, 'DELETE_ANY_COMMENT')) return true
  
  // Utilisateur peut supprimer ses propres commentaires
  if (hasPermission(user, 'DELETE_OWN_COMMENT')) {
    const userId = user._id || user.id
    const commentUserId = comment.userId?._id || comment.userId
    return userId === commentUserId
  }
  
  return false
}

/**
 * Vérifie si un utilisateur peut accéder au panneau admin
 * @param {Object} user - Objet utilisateur
 * @returns {boolean}
 */
export const canAccessAdminPanel = (user) => {
  return hasPermission(user, 'ACCESS_ADMIN_PANEL')
}

/**
 * Vérifie si un utilisateur peut gérer d'autres utilisateurs
 * @param {Object} user - Objet utilisateur
 * @returns {boolean}
 */
export const canManageUsers = (user) => {
  return hasPermission(user, 'VIEW_USERS')
}

/**
 * Vérifie si un utilisateur peut voir les statistiques
 * @param {Object} user - Objet utilisateur
 * @returns {boolean}
 */
export const canViewStats = (user) => {
  return hasPermission(user, 'VIEW_STATS')
}

/**
 * Vérifie si un utilisateur peut changer le rôle d'autres utilisateurs
 * @param {Object} user - Objet utilisateur
 * @returns {boolean}
 */
export const canChangeUserRole = (user) => {
  return hasPermission(user, 'CHANGE_USER_ROLE')
}

/**
 * Filtre une liste d'actions disponibles selon les permissions
 * @param {Object} user - Objet utilisateur
 * @param {Array} actions - Liste d'actions avec leur permission requise
 * @returns {Array} Actions autorisées
 */
export const filterAllowedActions = (user, actions) => {
  return actions.filter(action => {
    if (!action.permission) return true
    return hasPermission(user, action.permission)
  })
}

/**
 * Obtient toutes les permissions d'un utilisateur
 * @param {Object} user - Objet utilisateur
 * @returns {Array<string>} Liste des permissions
 */
export const getUserPermissions = (user) => {
  if (!user || !user.role) return []
  
  return Object.entries(PERMISSIONS)
    .filter(([, roles]) => roles.includes(user.role))
    .map(([permission]) => permission)
}

/**
 * Vérifie si un utilisateur a toutes les permissions spécifiées
 * @param {Object} user - Objet utilisateur
 * @param {Array<string>} permissions - Liste de permissions
 * @returns {boolean}
 */
export const hasAllPermissions = (user, permissions) => {
  return permissions.every(permission => hasPermission(user, permission))
}

/**
 * Vérifie si un utilisateur a au moins une des permissions spécifiées
 * @param {Object} user - Objet utilisateur
 * @param {Array<string>} permissions - Liste de permissions
 * @returns {boolean}
 */
export const hasAnyPermission = (user, permissions) => {
  return permissions.some(permission => hasPermission(user, permission))
}

/**
 * Obtient un message d'erreur de permission
 * @param {string} permission - Permission refusée
 * @returns {string} Message d'erreur
 */
export const getPermissionErrorMessage = (permission) => {
  const messages = {
    CREATE_OBSERVATION: "Vous n'avez pas la permission de créer une observation",
    EDIT_ANY_OBSERVATION: "Vous n'avez pas la permission d'éditer cette observation",
    DELETE_ANY_OBSERVATION: "Vous n'avez pas la permission de supprimer cette observation",
    ACCESS_ADMIN_PANEL: "Vous devez être administrateur pour accéder à cette section",
    MANAGE_USERS: "Seuls les administrateurs peuvent gérer les utilisateurs",
    VIEW_STATS: "Vous n'avez pas accès aux statistiques"
  }
  
  return messages[permission] || "Vous n'avez pas la permission d'effectuer cette action"
}
