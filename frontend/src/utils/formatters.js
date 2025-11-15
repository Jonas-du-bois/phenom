/**
 * Utilitaires de formatage de données
 */

/**
 * Formate une date en format français lisible
 * @param {string|Date} date - Date à formater
 * @returns {string} Date formatée
 */
export const formatDate = (date) => {
  if (!date) return "Date inconnue";
  return new Date(date).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Formate une date en format court
 * @param {string|Date} date - Date à formater
 * @returns {string} Date formatée (ex: 13/11/2025)
 */
export const formatDateShort = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("fr-FR");
};

/**
 * Formate une date en format relatif (il y a X minutes/heures/jours)
 * @param {string|Date} date - Date à formater
 * @returns {string} Temps relatif
 */
export const formatRelativeTime = (date) => {
  if (!date) return "Inconnu";

  const now = new Date();
  const target = new Date(date);
  const diffMs = now - target;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "À l'instant";
  if (diffMin < 60) return `Il y a ${diffMin} minute${diffMin > 1 ? "s" : ""}`;
  if (diffHour < 24)
    return `Il y a ${diffHour} heure${diffHour > 1 ? "s" : ""}`;
  if (diffDay < 7) return `Il y a ${diffDay} jour${diffDay > 1 ? "s" : ""}`;

  return formatDateShort(date);
};

/**
 * Récupère les initiales d'un utilisateur
 * @param {Object} user - Objet utilisateur (comment, user, etc.)
 * @returns {string} Initiales (ex: "JD")
 */
export const getInitials = (user) => {
  // Essayer d'obtenir le nom depuis différents champs
  const name =
    user?.userId?.name ||
    user?.author?.name ||
    user?.userId?.username ||
    user?.author?.username ||
    user?.name;
  if (!name) return "?";

  // Prendre les initiales (première lettre de chaque mot)
  const parts = name.split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

/**
 * Formate un nombre en format lisible (ex: 1234 -> 1,234)
 * @param {number} num - Nombre à formater
 * @returns {string} Nombre formaté
 */
export const formatNumber = (num) => {
  if (num === null || num === undefined) return "0";
  return num.toLocaleString("fr-FR");
};

/**
 * Formate une taille de fichier en format lisible
 * @param {number} bytes - Taille en bytes
 * @returns {string} Taille formatée (ex: "1.5 MB")
 */
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return "0 B";

  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = (bytes / Math.pow(1024, i)).toFixed(2);

  return `${size} ${sizes[i]}`;
};

/**
 * Tronque un texte avec des points de suspension
 * @param {string} text - Texte à tronquer
 * @param {number} maxLength - Longueur maximale
 * @returns {string} Texte tronqué
 */
export const truncate = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};
