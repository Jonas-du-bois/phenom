/**
 * @desc Classe de base pour les erreurs personnalisées
 */
class CustomError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * @desc Erreur pour les ressources non trouvées (404)
 */
export class NotFoundError extends CustomError {
  constructor(message = 'Ressource non trouvée') {
    super(message, 404);
  }
}

/**
 * @desc Erreur pour les requêtes invalides (400)
 */
export class BadRequestError extends CustomError {
  constructor(message = 'Requête invalide') {
    super(message, 400);
  }
}

/**
 * @desc Erreur pour les problèmes d'authentification (401)
 */
export class UnauthorizedError extends CustomError {
  constructor(message = 'Non authentifié') {
    super(message, 401);
  }
}

/**
 * @desc Erreur pour les problèmes d'autorisation (403)
 */
export class ForbiddenError extends CustomError {
  constructor(message = 'Accès interdit') {
    super(message, 403);
  }
}
