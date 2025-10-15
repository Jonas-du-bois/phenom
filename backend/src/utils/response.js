/**
 * Utilitaires pour formater les réponses HTTP de manière cohérente
 */

/**
 * Réponse de succès standard
 * @param {Object} res - Objet response Express
 * @param {*} data - Données à retourner
 * @param {string} message - Message optionnel
 * @param {number} statusCode - Code de statut HTTP (default: 200)
 */
export const successResponse = (res, data, message = null, statusCode = 200) => {
  const response = {
    success: true,
    data
  };

  if (message) {
    response.message = message;
  }

  return res.status(statusCode).json(response);
};

/**
 * Réponse de création réussie
 * @param {Object} res - Objet response Express
 * @param {*} data - Données créées
 * @param {string} message - Message optionnel
 */
export const createdResponse = (res, data, message = 'Ressource créée avec succès') => {
  return successResponse(res, data, message, 201);
};

/**
 * Réponse d'erreur standard
 * @param {Object} res - Objet response Express
 * @param {string} error - Message d'erreur
 * @param {number} statusCode - Code de statut HTTP (default: 400)
 * @param {*} details - Détails additionnels
 */
export const errorResponse = (res, error, statusCode = 400, details = null) => {
  const response = {
    success: false,
    error
  };

  if (details) {
    response.details = details;
  }

  return res.status(statusCode).json(response);
};

/**
 * Réponse non autorisée
 * @param {Object} res - Objet response Express
 * @param {string} message - Message d'erreur
 */
export const unauthorizedResponse = (res, message = 'Non autorisé') => {
  return errorResponse(res, message, 401);
};

/**
 * Réponse interdit
 * @param {Object} res - Objet response Express
 * @param {string} message - Message d'erreur
 */
export const forbiddenResponse = (res, message = 'Accès interdit') => {
  return errorResponse(res, message, 403);
};

/**
 * Réponse non trouvé
 * @param {Object} res - Objet response Express
 * @param {string} message - Message d'erreur
 */
export const notFoundResponse = (res, message = 'Ressource non trouvée') => {
  return errorResponse(res, message, 404);
};
