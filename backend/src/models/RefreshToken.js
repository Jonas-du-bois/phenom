import mongoose from 'mongoose';

/**
 * Modèle pour tracker les refresh tokens actifs
 * Permet la révocation de tokens et la gestion de sessions
 */
const refreshTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  token: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  // Hash du token pour plus de sécurité (optionnel mais recommandé)
  tokenHash: {
    type: String,
    required: false
  },
  // Informations sur le client
  userAgent: {
    type: String,
    default: ''
  },
  ipAddress: {
    type: String,
    default: ''
  },
  // Métadonnées
  isRevoked: {
    type: Boolean,
    default: false
  },
  revokedAt: {
    type: Date,
    default: null
  },
  revokedReason: {
    type: String,
    default: null
  },
  // Date d'expiration du token
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },
  // Dernière utilisation
  lastUsedAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 60 * 24 * 30 // Auto-suppression après 30 jours
  }
});

// Index composé pour requêtes efficaces
refreshTokenSchema.index({ userId: 1, isRevoked: 1 });
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

/**
 * Méthode statique pour créer un nouveau refresh token
 * @param {string} userId - ID de l'utilisateur
 * @param {string} token - Token JWT
 * @param {Date} expiresAt - Date d'expiration
 * @param {Object} metadata - Métadonnées (userAgent, ip)
 * @returns {Promise<RefreshToken>}
 */
refreshTokenSchema.statics.createToken = async function(userId, token, expiresAt, metadata = {}) {
  return await this.create({
    userId,
    token,
    expiresAt,
    userAgent: metadata.userAgent || '',
    ipAddress: metadata.ipAddress || ''
  });
};

/**
 * Méthode statique pour vérifier si un token est valide
 * @param {string} token - Token à vérifier
 * @returns {Promise<boolean>}
 */
refreshTokenSchema.statics.isValid = async function(token) {
  const refreshToken = await this.findOne({
    token,
    isRevoked: false,
    expiresAt: { $gt: new Date() }
  });
  
  return !!refreshToken;
};

/**
 * Méthode statique pour révoquer un token
 * @param {string} token - Token à révoquer
 * @param {string} reason - Raison de la révocation
 * @returns {Promise<boolean>}
 */
refreshTokenSchema.statics.revokeToken = async function(token, reason = 'Manual revocation') {
  const result = await this.updateOne(
    { token },
    {
      $set: {
        isRevoked: true,
        revokedAt: new Date(),
        revokedReason: reason
      }
    }
  );
  
  return result.modifiedCount > 0;
};

/**
 * Méthode statique pour révoquer tous les tokens d'un utilisateur
 * @param {string} userId - ID de l'utilisateur
 * @param {string} reason - Raison de la révocation
 * @returns {Promise<number>} Nombre de tokens révoqués
 */
refreshTokenSchema.statics.revokeAllUserTokens = async function(userId, reason = 'User logout from all devices') {
  const result = await this.updateMany(
    { userId, isRevoked: false },
    {
      $set: {
        isRevoked: true,
        revokedAt: new Date(),
        revokedReason: reason
      }
    }
  );
  
  return result.modifiedCount;
};

/**
 * Méthode statique pour nettoyer les tokens expirés
 * @returns {Promise<number>} Nombre de tokens supprimés
 */
refreshTokenSchema.statics.cleanupExpired = async function() {
  const result = await this.deleteMany({
    expiresAt: { $lt: new Date() }
  });
  
  return result.deletedCount;
};

/**
 * Méthode statique pour obtenir les sessions actives d'un utilisateur
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise<Array>}
 */
refreshTokenSchema.statics.getUserSessions = async function(userId) {
  return await this.find({
    userId,
    isRevoked: false,
    expiresAt: { $gt: new Date() }
  })
  .select('userAgent ipAddress createdAt lastUsedAt')
  .sort({ lastUsedAt: -1 });
};

/**
 * Méthode d'instance pour mettre à jour la dernière utilisation
 */
refreshTokenSchema.methods.updateLastUsed = async function() {
  this.lastUsedAt = new Date();
  return await this.save();
};

const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);

export default RefreshToken;
