import { validationResult } from 'express-validator';

/**
 * Middleware de validation des données
 * Vérifie les résultats de express-validator et retourne les erreurs
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg
    }));

    return res.status(400).json({
      success: false,
      error: 'Validation échouée',
      details: formattedErrors
    });
  }

  next();
};
