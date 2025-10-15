/**
 * Middleware d'autorisation par rôle
 * Vérifie que l'utilisateur authentifié a les permissions nécessaires
 * @param {...string} roles - Rôles autorisés
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentification requise'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Accès interdit: permissions insuffisantes'
      });
    }

    next();
  };
};

/**
 * Middleware pour vérifier que l'utilisateur est propriétaire de la ressource
 * @param {Function} getResourceOwnerId - Fonction qui retourne l'ID du propriétaire
 */
export const isOwnerOrAdmin = (getResourceOwnerId) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentification requise'
        });
      }

      // Les admins ont accès à tout
      if (req.user.role === 'admin') {
        return next();
      }

      // Récupérer l'ID du propriétaire de la ressource
      const ownerId = await getResourceOwnerId(req);

      if (!ownerId) {
        return res.status(404).json({
          success: false,
          error: 'Ressource non trouvée'
        });
      }

      // Vérifier si l'utilisateur est le propriétaire
      if (ownerId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          error: 'Accès interdit: vous n\'êtes pas le propriétaire de cette ressource'
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la vérification des permissions'
      });
    }
  };
};
