/**
 * Middleware d'audit pour enregistrer les opérations sensibles
 * Tracks: authentification, modifications admin, suppressions, etc.
 */

/**
 * Enregistre un événement d'audit
 * @param {string} action - Type d'action (LOGIN, LOGOUT, CREATE, UPDATE, DELETE, etc.)
 * @param {Object} details - Détails de l'opération
 * @param {Object} req - Objet Request Express
 */
export const logAuditEvent = (action, details, req) => {
  const auditEntry = {
    timestamp: new Date().toISOString(),
    action,
    userId: req.user?._id || 'anonymous',
    userEmail: req.user?.email || 'anonymous',
    userRole: req.user?.role || 'none',
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('user-agent'),
    path: req.path,
    method: req.method,
    details
  };

  // En production, utiliser un système de logging approprié (Winston, Pino, etc.)
  // Pour l'instant, log sur console avec préfixe AUDIT
  console.log('[AUDIT]', JSON.stringify(auditEntry));

  // TODO: Implémenter stockage dans base de données ou service de logging externe
  // - MongoDB collection pour logs
  // - Service externe (Datadog, LogDNA, etc.)
  // - Fichier de log rotatif
};

/**
 * Middleware pour auditer les authentifications réussies
 */
export const auditLogin = (req, res, next) => {
  // Intercepter la réponse pour vérifier le succès
  const originalJson = res.json;
  res.json = function (data) {
    if (data.success && req.path.includes('/login')) {
      logAuditEvent('LOGIN_SUCCESS', {
        email: req.body.email
      }, req);
    }
    return originalJson.call(this, data);
  };
  next();
};

/**
 * Middleware pour auditer les échecs d'authentification
 */
export const auditFailedLogin = (email, req) => {
  logAuditEvent('LOGIN_FAILED', {
    email,
    reason: 'Invalid credentials'
  }, req);
};

/**
 * Middleware pour auditer les créations de compte
 */
export const auditSignup = (req, res, next) => {
  const originalJson = res.json;
  res.json = function (data) {
    if (data.success && req.path.includes('/signup')) {
      logAuditEvent('SIGNUP', {
        email: req.body.email,
        name: req.body.name
      }, req);
    }
    return originalJson.call(this, data);
  };
  next();
};

/**
 * Middleware pour auditer les déconnexions
 */
export const auditLogout = (req, res, next) => {
  logAuditEvent('LOGOUT', {
    userId: req.user._id,
    email: req.user.email
  }, req);
  next();
};

/**
 * Middleware pour auditer les changements de rôle (admin)
 */
export const auditRoleChange = (targetUserId, newRole, req) => {
  logAuditEvent('ROLE_CHANGE', {
    targetUserId,
    newRole,
    changedBy: req.user._id,
    changedByEmail: req.user.email
  }, req);
};

/**
 * Middleware pour auditer les suppressions administratives
 */
export const auditAdminDelete = (resourceType, resourceId, req) => {
  logAuditEvent('ADMIN_DELETE', {
    resourceType,
    resourceId,
    deletedBy: req.user._id,
    deletedByEmail: req.user.email
  }, req);
};

/**
 * Middleware pour auditer les rafraîchissements de token
 */
export const auditTokenRefresh = (req, res, next) => {
  const originalJson = res.json;
  res.json = function (data) {
    if (data.success && req.path.includes('/refresh-token')) {
      logAuditEvent('TOKEN_REFRESH', {
        // Ne pas logger le token lui-même pour des raisons de sécurité
        success: true
      }, req);
    }
    return originalJson.call(this, data);
  };
  next();
};

/**
 * Middleware pour auditer les tentatives de refresh token invalides
 */
export const auditInvalidRefreshToken = (req) => {
  logAuditEvent('INVALID_REFRESH_TOKEN', {
    reason: 'Token expired or invalid'
  }, req);
};

/**
 * Middleware pour auditer les modifications de mot de passe
 */
export const auditPasswordChange = (req, res, next) => {
  logAuditEvent('PASSWORD_CHANGE', {
    userId: req.user._id,
    email: req.user.email
  }, req);
  next();
};

/**
 * Middleware pour auditer les demandes de réinitialisation de mot de passe
 */
export const auditPasswordResetRequest = (email, req) => {
  logAuditEvent('PASSWORD_RESET_REQUEST', {
    email
  }, req);
};

/**
 * Middleware pour auditer les réinitialisations de mot de passe réussies
 */
export const auditPasswordReset = (email, req) => {
  logAuditEvent('PASSWORD_RESET_SUCCESS', {
    email
  }, req);
};

export default {
  logAuditEvent,
  auditLogin,
  auditFailedLogin,
  auditSignup,
  auditLogout,
  auditRoleChange,
  auditAdminDelete,
  auditTokenRefresh,
  auditInvalidRefreshToken,
  auditPasswordChange,
  auditPasswordResetRequest,
  auditPasswordReset
};
