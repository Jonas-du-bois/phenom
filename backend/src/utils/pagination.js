/**
 * Extrait les paramètres de pagination depuis la requête
 * @param {Object} query - Objet query de la requête Express
 * @returns {Object} Paramètres de pagination
 */
export const getPaginationParams = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(
    parseInt(query.limit) || parseInt(process.env.DEFAULT_PAGE_SIZE) || 10,
    parseInt(process.env.MAX_PAGE_SIZE) || 100
  );
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

/**
 * Crée un objet de métadonnées de pagination
 * @param {number} total - Nombre total d'éléments
 * @param {number} page - Page actuelle
 * @param {number} limit - Nombre d'éléments par page
 * @returns {Object} Métadonnées de pagination
 */
export const createPaginationMeta = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1
  };
};

/**
 * Formate la réponse paginée
 * @param {Array} data - Données à retourner
 * @param {number} total - Nombre total d'éléments
 * @param {number} page - Page actuelle
 * @param {number} limit - Nombre d'éléments par page
 * @returns {Object} Réponse formatée
 */
export const paginatedResponse = (data, total, page, limit) => {
  return {
    success: true,
    data,
    pagination: createPaginationMeta(total, page, limit)
  };
};
