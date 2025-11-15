/**
 * Utilitaires pour la gestion et manipulation des utilisateurs
 */

/**
 * Vérifie si un utilisateur est admin
 * @param {Object} user - Objet utilisateur
 * @returns {boolean}
 */
export const isAdmin = (user) => {
  return user?.role === "admin";
};

/**
 * Vérifie si un utilisateur est viewer
 * @param {Object} user - Objet utilisateur
 * @returns {boolean}
 */
export const isViewer = (user) => {
  return user?.role === "viewer";
};

/**
 * Vérifie si un utilisateur est propriétaire d'une ressource
 * @param {Object} user - Objet utilisateur
 * @param {Object} resource - Ressource avec userId
 * @returns {boolean}
 */
export const isOwner = (user, resource) => {
  if (!user || !resource) return false;
  const userId = user._id || user.id;
  const resourceUserId = resource.userId?._id || resource.userId;
  return userId === resourceUserId;
};

/**
 * Vérifie si un utilisateur peut éditer une ressource
 * @param {Object} user - Objet utilisateur
 * @param {Object} resource - Ressource à éditer
 * @returns {boolean}
 */
export const canEdit = (user, resource) => {
  return isAdmin(user) || isOwner(user, resource);
};

/**
 * Vérifie si un utilisateur peut supprimer une ressource
 * @param {Object} user - Objet utilisateur
 * @param {Object} resource - Ressource à supprimer
 * @returns {boolean}
 */
export const canDelete = (user, resource) => {
  return isAdmin(user) || isOwner(user, resource);
};

/**
 * Obtient le nom complet ou les initiales de l'utilisateur
 * @param {Object} user - Objet utilisateur
 * @param {boolean} initials - Si true, retourne les initiales
 * @returns {string}
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
 * Formate les informations utilisateur pour l'affichage
 * @param {Object} user - Objet utilisateur
 * @returns {Object} Données formatées
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
 * Valide les données d'un utilisateur
 * @param {Object} userData - Données utilisateur à valider
 * @param {boolean} isUpdate - Si true, certains champs sont optionnels
 * @returns {Object} { valid: boolean, errors: Object }
 */
export const validateUserData = (userData, isUpdate = false) => {
  const errors = {};

  // Nom
  if (!isUpdate || userData.name !== undefined) {
    if (!userData.name || userData.name.trim().length < 2) {
      errors.name = "Le nom doit contenir au moins 2 caractères";
    } else if (userData.name.length > 50) {
      errors.name = "Le nom ne peut pas dépasser 50 caractères";
    }
  }

  // Email
  if (!isUpdate || userData.email !== undefined) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!userData.email || !emailRegex.test(userData.email)) {
      errors.email = "Email invalide";
    }
  }

  // Mot de passe (uniquement à la création ou si fourni)
  if (!isUpdate || userData.password !== undefined) {
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
 * Filtre une liste d'utilisateurs
 * @param {Array} users - Liste des utilisateurs
 * @param {Object} filters - Filtres { role, searchText }
 * @returns {Array} Utilisateurs filtrés
 */
export const filterUsers = (users, filters = {}) => {
  let filtered = [...users];

  // Filtre par rôle
  if (filters.role) {
    filtered = filtered.filter((user) => user.role === filters.role);
  }

  // Recherche textuelle
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
 * Trie une liste d'utilisateurs
 * @param {Array} users - Liste des utilisateurs
 * @param {string} field - Champ de tri (name, email, createdAt, role)
 * @param {string} order - 'asc' ou 'desc'
 * @returns {Array} Utilisateurs triés
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
 * Calcule des statistiques sur les utilisateurs
 * @param {Array} users - Liste des utilisateurs
 * @returns {Object} Statistiques
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
 * Nettoie les données utilisateur pour envoi au serveur
 * @param {Object} userData - Données utilisateur
 * @returns {Object} Données nettoyées
 */
export const sanitizeUserData = (userData) => {
  const sanitized = {};

  if (userData.name !== undefined) {
    sanitized.name = userData.name.trim();
  }

  if (userData.email !== undefined) {
    sanitized.email = userData.email.trim().toLowerCase();
  }

  if (userData.password !== undefined && userData.password) {
    sanitized.password = userData.password;
  }

  if (userData.bio !== undefined) {
    sanitized.bio = userData.bio.trim();
  }

  if (userData.role !== undefined) {
    sanitized.role = userData.role;
  }

  return sanitized;
};

/**
 * Génère un avatar par défaut basé sur les initiales
 * @param {Object} user - Objet utilisateur
 * @returns {Object} { initials, color, backgroundColor }
 */
export const generateDefaultAvatar = (user) => {
  const initials = getUserDisplayName(user, true);

  // Couleurs basées sur la première lettre
  const colors = [
    { bg: "#FF6B6B", text: "#FFFFFF" }, // Rouge
    { bg: "#4ECDC4", text: "#FFFFFF" }, // Turquoise
    { bg: "#45B7D1", text: "#FFFFFF" }, // Bleu
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
