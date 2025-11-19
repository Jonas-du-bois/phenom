import User from '../models/User.js';
import Observation from '../models/Observation.js';
import Comment from '../models/Comment.js';
import { getPaginationParams, createPaginationMeta } from '../utils/pagination.js';

/**
 * Service pour la gestion des utilisateurs
 */
class UserService {
  /**
   * Récupère le profil complet de l'utilisateur
   * @param {string} userId - ID de l'utilisateur
   * @returns {Object} Profil utilisateur avec statistiques
   */
  async getProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    // Récupérer les statistiques
    const [observationsCount, commentsCount] = await Promise.all([
      Observation.countDocuments({ userId }),
      Comment.countDocuments({ userId })
    ]);

    const profile = user.toSafeObject();
    profile.observationsCount = observationsCount;
    profile.commentsCount = commentsCount;

    return profile;
  }

  /**
   * Récupère les statistiques d'un utilisateur
   * @param {string} userId - ID de l'utilisateur
   * @returns {Object} Statistiques de l'utilisateur
   */
  async getUserStats(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    const [observationsCount, commentsCount] = await Promise.all([
      Observation.countDocuments({ userId }),
      Comment.countDocuments({ userId })
    ]);

    return {
      observationsCount,
      commentsCount
    };
  }

  /**
   * Met à jour le profil de l'utilisateur
   * @param {string} userId - ID de l'utilisateur
   * @param {Object} updateData - Données à mettre à jour
   * @returns {Object} Utilisateur mis à jour
   */
  async updateProfile(userId, updateData) {
    const { name, email, bio } = updateData;

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    if (email) {
      const existingUser = await User.findOne({
        email,
        _id: { $ne: userId }
      });
      if (existingUser) {
        throw new Error('EMAIL_ALREADY_EXISTS');
      }
    }

    // Mettre à jour l'utilisateur
    const user = await User.findByIdAndUpdate(
      userId,
      {
        ...(name && { name }),
        ...(email && { email }),
        ...(bio !== undefined && { bio })
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    return user.toSafeObject();
  }

  /**
   * Change le mot de passe de l'utilisateur
   * @param {string} userId - ID de l'utilisateur
   * @param {string} currentPassword - Mot de passe actuel
   * @param {string} newPassword - Nouveau mot de passe
   * @returns {boolean} true si le changement a réussi
   */
  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select('+password');
    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    // Vérifier le mot de passe actuel
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      throw new Error('INVALID_CURRENT_PASSWORD');
    }

    // Vérifier que le nouveau mot de passe est différent de l'ancien
    const isSamePassword = await user.comparePassword(newPassword);
    if (isSamePassword) {
      throw new Error('NEW_PASSWORD_SAME_AS_CURRENT');
    }

    // Mettre à jour le mot de passe
    user.password = newPassword;
    await user.save();

    return true;
  }

  /**
   * Supprime le compte de l'utilisateur
   * @param {string} userId - ID de l'utilisateur
   * @returns {boolean} true si la suppression a réussi
   */
  async deleteAccount(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    // Récupérer toutes les observations de l'utilisateur
    const observations = await Observation.find({ userId }).select('_id');

    // Supprimer les images Cloudinary pour chaque observation
    if (observations.length > 0) {
      try {
        const imageService = (await import('./image.service.js')).default;
        let totalDeletedImages = 0;

        for (const observation of observations) {
          const deletedImages = await imageService.deleteAllImagesForObservation(observation._id.toString());
          totalDeletedImages += deletedImages;
        }

        console.log(`✅ [DeleteAccount] ${totalDeletedImages} image(s) supprimée(s) de Cloudinary pour ${observations.length} observation(s)`);
      } catch (error) {
        console.error(`❌ [DeleteAccount] Erreur lors de la suppression des images: ${error.message}`);
      }
    }

    // Supprimer toutes les observations de l'utilisateur
    await Observation.deleteMany({ userId });

    // Supprimer tous les commentaires de l'utilisateur
    await Comment.deleteMany({ userId });

    // Supprimer l'utilisateur
    await User.findByIdAndDelete(userId);

    return true;
  }

  /**
   * Récupère les observations de l'utilisateur
   * @param {string} userId - ID de l'utilisateur
   * @param {Object} query - Paramètres de requête
   * @returns {Object} Observations paginées
   */
  async getUserObservations(userId, query) {
    const { page, limit, skip } = getPaginationParams(query);
    const sortBy = query.sortBy || 'createdAt';
    const order = query.order === 'asc' ? 1 : -1;

    const [observations, total] = await Promise.all([
      Observation.find({ userId })
        .sort({ [sortBy]: order })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name email')
        .lean(),
      Observation.countDocuments({ userId })
    ]);

    return {
      data: observations,
      pagination: createPaginationMeta(total, page, limit)
    };
  }
}

export default new UserService();
