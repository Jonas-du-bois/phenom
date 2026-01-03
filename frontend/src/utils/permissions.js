/**
 * Permission and Authorization Utilities
 *
 * Centralized permission system for the application.
 * Defines roles, permissions per role, and provides
 * functions to check user permissions.
 *
 * @module utils/permissions
 *
 * Roles:
 * - ADMIN: Full access to all features
 * - VIEWER: Can create/edit own content, view all
 *
 * Permission Categories:
 * - Observations: Create, edit, delete (own vs any)
 * - Comments: Create, edit, delete (own vs any)
 * - Users: View, create, edit, delete, change role
 * - Administration: Panel access, stats, system management
 */

// ============================================================================
// ROLE DEFINITIONS
// ============================================================================

/**
 * Available roles in the application
 */
export const ROLES = {
  ADMIN: "admin",
  VIEWER: "viewer",
};

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
  MANAGE_SYSTEM: [ROLES.ADMIN],
};

/**
 * Check if a user has a specific role
 * @param {Object} user - User object
 * @param {string} role - Role to check
 * @returns {boolean}
 */
export const hasRole = (user, role) => {
  return user?.role === role;
};

/**
 * Check if a user has a permission
 * @param {Object} user - User object
 * @param {string} permission - Permission to check (e.g., 'CREATE_OBSERVATION')
 * @returns {boolean}
 */
export const hasPermission = (user, permission) => {
  if (!user || !user.role) return false;
  const allowedRoles = PERMISSIONS[permission];
  return allowedRoles ? allowedRoles.includes(user.role) : false;
};

/**
 * Check if a user can create an observation
 * @param {Object} user - User object
 * @returns {boolean}
 */
export const canCreateObservation = (user) => {
  return hasPermission(user, "CREATE_OBSERVATION");
};

/**
 * Check if a user can edit an observation
 * @param {Object} user - User object
 * @param {Object} observation - Observation to edit
 * @returns {boolean}
 */
export const canEditObservation = (user, observation) => {
  if (!user || !observation) return false;

  // Admin can edit anything
  if (hasPermission(user, "EDIT_ANY_OBSERVATION")) return true;

  // User can edit their own observations
  if (hasPermission(user, "EDIT_OWN_OBSERVATION")) {
    const userId = user._id || user.id;
    const obsUserId = observation.userId?._id || observation.userId;
    return userId === obsUserId;
  }

  return false;
};

/**
 * Check if a user can delete an observation
 * @param {Object} user - User object
 * @param {Object} observation - Observation to delete
 * @returns {boolean}
 */
export const canDeleteObservation = (user, observation) => {
  if (!user || !observation) return false;

  // Admin can delete anything
  if (hasPermission(user, "DELETE_ANY_OBSERVATION")) return true;

  // User can delete their own observations
  if (hasPermission(user, "DELETE_OWN_OBSERVATION")) {
    const userId = user._id || user.id;
    const obsUserId = observation.userId?._id || observation.userId;
    return userId === obsUserId;
  }

  return false;
};

/**
 * Check if a user can create a comment
 * @param {Object} user - User object
 * @returns {boolean}
 */
export const canCreateComment = (user) => {
  return hasPermission(user, "CREATE_COMMENT");
};

/**
 * Check if a user can edit a comment
 * @param {Object} user - User object
 * @param {Object} comment - Comment to edit
 * @returns {boolean}
 */
export const canEditComment = (user, comment) => {
  if (!user || !comment) return false;

  // Admin can edit anything
  if (hasPermission(user, "EDIT_ANY_COMMENT")) return true;

  // User can edit their own comments
  if (hasPermission(user, "EDIT_OWN_COMMENT")) {
    const userId = user._id || user.id;
    const commentUserId = comment.userId?._id || comment.userId;
    return userId === commentUserId;
  }

  return false;
};

/**
 * Check if a user can delete a comment
 * @param {Object} user - User object
 * @param {Object} comment - Comment to delete
 * @returns {boolean}
 */
export const canDeleteComment = (user, comment) => {
  if (!user || !comment) return false;

  // Admin can delete anything
  if (hasPermission(user, "DELETE_ANY_COMMENT")) return true;

  // User can delete their own comments
  if (hasPermission(user, "DELETE_OWN_COMMENT")) {
    const userId = user._id || user.id;
    const commentUserId = comment.userId?._id || comment.userId;
    return userId === commentUserId;
  }

  return false;
};

/**
 * Check if a user can access the admin panel
 * @param {Object} user - User object
 * @returns {boolean}
 */
export const canAccessAdminPanel = (user) => {
  return hasPermission(user, "ACCESS_ADMIN_PANEL");
};

/**
 * Check if a user can manage other users
 * @param {Object} user - User object
 * @returns {boolean}
 */
export const canManageUsers = (user) => {
  return hasPermission(user, "VIEW_USERS");
};

/**
 * Check if a user can view statistics
 * @param {Object} user - User object
 * @returns {boolean}
 */
export const canViewStats = (user) => {
  return hasPermission(user, "VIEW_STATS");
};

/**
 * Check if a user can change other users' roles
 * @param {Object} user - User object
 * @returns {boolean}
 */
export const canChangeUserRole = (user) => {
  return hasPermission(user, "CHANGE_USER_ROLE");
};

/**
 * Filter a list of available actions by user permissions
 * @param {Object} user - User object
 * @param {Array} actions - List of actions with required permission
 * @returns {Array} Allowed actions
 */
export const filterAllowedActions = (user, actions) => {
  return actions.filter((action) => {
    if (!action.permission) return true;
    return hasPermission(user, action.permission);
  });
};

/**
 * Get all permissions for a user
 * @param {Object} user - User object
 * @returns {Array<string>} List of permissions
 */
export const getUserPermissions = (user) => {
  if (!user || !user.role) return [];

  return Object.entries(PERMISSIONS)
    .filter(([, roles]) => roles.includes(user.role))
    .map(([permission]) => permission);
};

/**
 * Check if a user has all specified permissions
 * @param {Object} user - User object
 * @param {Array<string>} permissions - List of permissions
 * @returns {boolean}
 */
export const hasAllPermissions = (user, permissions) => {
  return permissions.every((permission) => hasPermission(user, permission));
};

/**
 * Check if a user has at least one of the specified permissions
 * @param {Object} user - User object
 * @param {Array<string>} permissions - List of permissions
 * @returns {boolean}
 */
export const hasAnyPermission = (user, permissions) => {
  return permissions.some((permission) => hasPermission(user, permission));
};

/**
 * Get a permission error message for display
 * Note: Messages are in French for end-user display
 * @param {string} permission - Denied permission
 * @returns {string} Localized error message
 */
export const getPermissionErrorMessage = (permission) => {
  const messages = {
    CREATE_OBSERVATION:
      "Vous n'avez pas la permission de créer une observation",
    EDIT_ANY_OBSERVATION:
      "Vous n'avez pas la permission d'éditer cette observation",
    DELETE_ANY_OBSERVATION:
      "Vous n'avez pas la permission de supprimer cette observation",
    ACCESS_ADMIN_PANEL:
      "Vous devez être administrateur pour accéder à cette section",
    MANAGE_USERS: "Seuls les administrateurs peuvent gérer les utilisateurs",
    VIEW_STATS: "Vous n'avez pas accès aux statistiques",
  };

  return (
    messages[permission] ||
    "Vous n'avez pas la permission d'effectuer cette action"
  );
};
