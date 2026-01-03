/**
 * User Helpers - Utilities for User Management
 *
 * Provides functions for user role checking, permission validation,
 * and user data formatting.
 *
 * @module utils/userHelpers
 *
 * Features:
 * - Role checks (admin, viewer)
 * - Ownership verification
 * - Permission checks for edit/delete operations
 * - User display name formatting
 * - User data validation and sanitization
 * - Default avatar generation
 */

// ============================================================================
// ROLE CHECKS
// ============================================================================

/**
 * Check if a user has the admin role
 * @param {Object} user - User object
 * @returns {boolean} True if user is an admin
 */
export const isAdmin = (user) => {
  return user?.role === "admin";
};

/**
 * Check if a user has the viewer role
 * @param {Object} user - User object
 * @returns {boolean} True if user is a viewer
 */
export const isViewer = (user) => {
  return user?.role === "viewer";
};

// ============================================================================
// OWNERSHIP AND PERMISSIONS
// ============================================================================

/**
 * Check if a user owns a resource
 * @param {Object} user - User object
 * @param {Object} resource - Resource with userId field
 * @returns {boolean} True if user is the owner of the resource
 */
export const isOwner = (user, resource) => {
  if (!user || !resource) return false;
  const userId = user._id || user.id;
  const resourceUserId = resource.userId?._id || resource.userId;
  return userId === resourceUserId;
};

/**
 * Check if a user can edit a resource (admin or owner)
 * @param {Object} user - User object
 * @param {Object} resource - Resource to edit
 * @returns {boolean} True if user can edit
 */
export const canEdit = (user, resource) => {
  return isAdmin(user) || isOwner(user, resource);
};

/**
 * Check if a user can delete a resource (admin or owner)
 * @param {Object} user - User object
 * @param {Object} resource - Resource to delete
 * @returns {boolean} True if user can delete
 */
export const canDelete = (user, resource) => {
  return isAdmin(user) || isOwner(user, resource);
};

// ============================================================================
// USER DISPLAY
// ============================================================================

/**
 * Get user's display name or initials
 * @param {Object} user - User object
 * @param {boolean} initials - If true, return initials only (max 2 chars)
 * @returns {string} Display name or initials ("Anonyme" if no user)
 */
export const getUserDisplayName = (user, initials = false) => {
  if (!user) return "Anonyme";

  const name = user.name || user.email?.split("@")[0] || "Utilisateur";

  if (initials) {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  return name;
};

/**
 * Format user object for display in UI
 * @param {Object} user - User object
 * @returns {Object|null} Formatted user data with computed fields
 */
export const formatUserForDisplay = (user) => {
  if (!user) return null;

  return {
    id: user._id || user.id,
    name: getUserDisplayName(user),
    initials: getUserDisplayName(user, true),
    email: user.email,
    role: user.role,
    roleLabel: user.role === "admin" ? "Administrateur" : "Observateur",
    bio: user.bio || "",
    isAdmin: isAdmin(user),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

/**
 * Validate user data
 * Note: Error messages are in French for end-user display
 * @param {Object} userData - User data to validate
 * @param {boolean} isUpdate - If true, some fields are optional (partial update)
 * @returns {Object} { valid: boolean, errors: Object }
 */
export const validateUserData = (userData, isUpdate = false) => {
  const errors = {};

  // Name - in update mode, only validate if field is filled
  const hasName = userData.name !== undefined && userData.name.trim() !== "";
  if (!isUpdate && !hasName) {
    errors.name = "Le nom doit contenir au moins 2 caractères";
  } else if (hasName) {
    if (userData.name.trim().length < 2) {
      errors.name = "Le nom doit contenir au moins 2 caractères";
    } else if (userData.name.length > 50) {
      errors.name = "Le nom ne peut pas dépasser 50 caractères";
    }
  }

  // Email - in update mode, only validate if field is filled
  const hasEmail = userData.email !== undefined && userData.email.trim() !== "";
  if (!isUpdate && !hasEmail) {
    errors.email = "Email invalide";
  } else if (hasEmail) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      errors.email = "Email invalide";
    }
  }

  // Password (only on creation or if provided)
  if (!isUpdate || (userData.password && userData.password.length > 0)) {
    if (userData.password && userData.password.length < 6) {
      errors.password = "Le mot de passe doit contenir au moins 6 caractères";
    }
  }

  // Bio
  if (userData.bio && userData.bio.length > 500) {
    errors.bio = "La bio ne peut pas dépasser 500 caractères";
  }

  // Role
  if (userData.role && !["admin", "viewer"].includes(userData.role)) {
    errors.role = "Rôle invalide";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Filter a list of users
 * @param {Array} users - List of users
 * @param {Object} filters - Filters { role, searchText }
 * @returns {Array} Filtered users
 */
export const filterUsers = (users, filters = {}) => {
  let filtered = [...users];

  // Filter by role
  if (filters.role) {
    filtered = filtered.filter((user) => user.role === filters.role);
  }

  // Text search
  if (filters.searchText) {
    const search = filters.searchText.toLowerCase().trim();
    filtered = filtered.filter((user) => {
      const name = (user.name || "").toLowerCase();
      const email = (user.email || "").toLowerCase();
      const bio = (user.bio || "").toLowerCase();
      return (
        name.includes(search) || email.includes(search) || bio.includes(search)
      );
    });
  }

  return filtered;
};

/**
 * Sort a list of users
 * @param {Array} users - List of users
 * @param {string} field - Sort field (name, email, createdAt, role)
 * @param {string} order - 'asc' or 'desc'
 * @returns {Array} Sorted users
 */
export const sortUsers = (users, field = "name", order = "asc") => {
  return [...users].sort((a, b) => {
    let aVal = a[field];
    let bVal = b[field];

    if (field === "createdAt" || field === "updatedAt") {
      aVal = new Date(aVal).getTime();
      bVal = new Date(bVal).getTime();
    }

    if (typeof aVal === "string") {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }

    if (order === "asc") {
      return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
    } else {
      return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
    }
  });
};

/**
 * Calculate statistics for users
 * @param {Array} users - List of users
 * @returns {Object} Statistics object
 */
export const calculateUserStats = (users) => {
  return {
    total: users.length,
    admins: users.filter((u) => u.role === "admin").length,
    viewers: users.filter((u) => u.role === "viewer").length,
    withBio: users.filter((u) => u.bio && u.bio.trim().length > 0).length,
    withoutBio: users.filter((u) => !u.bio || u.bio.trim().length === 0).length,
  };
};

/**
 * Sanitize user data for server submission
 * Only includes non-empty fields for partial updates
 * @param {Object} userData - User data
 * @returns {Object} Sanitized data
 */
export const sanitizeUserData = (userData) => {
  const sanitized = {};

  if (userData.name !== undefined && userData.name.trim() !== "") {
    sanitized.name = userData.name.trim();
  }

  if (userData.email !== undefined && userData.email.trim() !== "") {
    sanitized.email = userData.email.trim().toLowerCase();
  }

  if (userData.password !== undefined && userData.password) {
    sanitized.password = userData.password;
  }

  if (userData.bio !== undefined && userData.bio.trim() !== "") {
    sanitized.bio = userData.bio.trim();
  }

  if (userData.role !== undefined) {
    sanitized.role = userData.role;
  }

  return sanitized;
};

/**
 * Generate a default avatar based on initials
 * @param {Object} user - User object
 * @returns {Object} { initials, color, backgroundColor }
 */
export const generateDefaultAvatar = (user) => {
  const initials = getUserDisplayName(user, true);

  // Colors based on first letter
  const colors = [
    { bg: "#FF6B6B", text: "#FFFFFF" }, // Red
    { bg: "#4ECDC4", text: "#FFFFFF" }, // Turquoise
    { bg: "#45B7D1", text: "#FFFFFF" }, // Blue
    { bg: "#96CEB4", text: "#FFFFFF" }, // Vert
    { bg: "#FFEAA7", text: "#2D3436" }, // Jaune
    { bg: "#DFE6E9", text: "#2D3436" }, // Gris
    { bg: "#A29BFE", text: "#FFFFFF" }, // Violet
    { bg: "#FD79A8", text: "#FFFFFF" }, // Rose
  ];

  const charCode = initials.charCodeAt(0) || 65;
  const colorIndex = charCode % colors.length;

  return {
    initials,
    backgroundColor: colors[colorIndex].bg,
    color: colors[colorIndex].text,
  };
};
