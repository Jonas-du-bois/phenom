import User from "../models/User.js";
import Observation from "../models/Observation.js";
import Comment from "../models/Comment.js";
import {
  getPaginationParams,
  createPaginationMeta,
} from "../utils/pagination.js";
import { uploadImage, deleteImage } from "../config/cloudinary.js";
import sharp from "sharp";

/**
 * @file user.service.js
 * @description User management service.
 * Handles profile, password, avatar, and account operations.
 */
class UserService {
  /**
   * Retrieves the complete user profile
   * @param {string} userId - User ID
   * @returns {Object} User profile with statistics
   */
  async getProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }

    // Retrieve statistics
    const [observationsCount, commentsCount] = await Promise.all([
      Observation.countDocuments({ userId }),
      Comment.countDocuments({ userId }),
    ]);

    const profile = user.toSafeObject();
    profile.observationsCount = observationsCount;
    profile.commentsCount = commentsCount;

    return profile;
  }

  /**
   * Retrieves a user's statistics
   * @param {string} userId - User ID
   * @returns {Object} User statistics
   */
  async getUserStats(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }

    const [observationsCount, commentsCount] = await Promise.all([
      Observation.countDocuments({ userId }),
      Comment.countDocuments({ userId }),
    ]);

    return {
      observationsCount,
      commentsCount,
    };
  }

  /**
   * Updates the user's profile
   * @param {string} userId - User ID
   * @param {Object} updateData - Data to update
   * @returns {Object} Updated user
   */
  async updateProfile(userId, updateData) {
    const { name, email, bio } = updateData;

    // Check if email is already used by another user
    if (email) {
      const existingUser = await User.findOne({
        email,
        _id: { $ne: userId },
      });
      if (existingUser) {
        throw new Error("EMAIL_ALREADY_EXISTS");
      }
    }

    // Update the user
    const user = await User.findByIdAndUpdate(
      userId,
      {
        ...(name && { name }),
        ...(email && { email }),
        ...(bio !== undefined && { bio }),
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }

    return user.toSafeObject();
  }

  /**
   * Changes the user's password
   * @param {string} userId - User ID
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {boolean} true if change was successful
   */
  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select("+password");
    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      throw new Error("INVALID_CURRENT_PASSWORD");
    }

    // Verify that new password is different from old one
    const isSamePassword = await user.comparePassword(newPassword);
    if (isSamePassword) {
      throw new Error("NEW_PASSWORD_SAME_AS_CURRENT");
    }

    // Update password
    user.password = newPassword;
    await user.save();

    return true;
  }

  /**
   * Deletes the user's account
   * @param {string} userId - User ID
   * @returns {boolean} true if deletion was successful
   */
  async deleteAccount(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }

    // Delete user's avatar if exists
    if (user.avatar?.publicId) {
      try {
        await deleteImage(user.avatar.publicId);
        console.log(
          `🗑️ [DeleteAccount] Avatar supprimé: ${user.avatar.publicId}`
        );
      } catch (error) {
        console.error(
          `⚠️ [DeleteAccount] Erreur suppression avatar: ${error.message}`
        );
      }
    }

    // Retrieve all user's observations
    const observations = await Observation.find({ userId }).select("_id");

    // Delete Cloudinary images for each observation
    if (observations.length > 0) {
      try {
        const imageService = (await import("./image.service.js")).default;
        let totalDeletedImages = 0;

        for (const observation of observations) {
          const deletedImages =
            await imageService.deleteAllImagesForObservation(
              observation._id.toString()
            );
          totalDeletedImages += deletedImages;
        }

        console.log(
          `✅ [DeleteAccount] ${totalDeletedImages} image(s) supprimée(s) de Cloudinary pour ${observations.length} observation(s)`
        );
      } catch (error) {
        console.error(
          `❌ [DeleteAccount] Erreur lors de la suppression des images: ${error.message}`
        );
      }
    }

    // Delete all user's observations
    await Observation.deleteMany({ userId });

    // Delete all user's comments
    await Comment.deleteMany({ userId });

    // Delete the user
    await User.findByIdAndDelete(userId);

    return true;
  }

  /**
   * Retrieves the user's observations
   * @param {string} userId - User ID
   * @param {Object} query - Query parameters
   * @returns {Object} Paginated observations
   */
  async getUserObservations(userId, query) {
    const { page, limit, skip } = getPaginationParams(query);
    const sortBy = query.sortBy || "createdAt";
    const order = query.order === "asc" ? 1 : -1;

    const [observations, total] = await Promise.all([
      Observation.find({ userId })
        .sort({ [sortBy]: order })
        .skip(skip)
        .limit(limit)
        .populate("userId", "name email avatar")
        .lean(),
      Observation.countDocuments({ userId }),
    ]);

    return {
      data: observations,
      pagination: createPaginationMeta(total, page, limit),
    };
  }

  /**
   * Uploads or updates the user's avatar
   * @param {string} userId - User ID
   * @param {Buffer} buffer - Image buffer
   * @param {string} mimetype - Image MIME type
   * @returns {Object} Avatar information
   */
  async uploadAvatar(userId, buffer, mimetype) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }

    // Delete old avatar if exists
    if (user.avatar?.publicId) {
      try {
        await deleteImage(user.avatar.publicId);
        console.log(`🗑️ Ancien avatar supprimé: ${user.avatar.publicId}`);
      } catch (error) {
        console.error(`⚠️ Erreur suppression ancien avatar: ${error.message}`);
      }
    }

    // Compress and resize the image
    const compressed = await sharp(buffer)
      .resize(256, 256, {
        fit: "cover",
        position: "center",
      })
      .jpeg({ quality: 85 })
      .toBuffer();

    // Upload to Cloudinary
    const publicId = `phenom/avatars/${userId}_${Date.now()}`;
    const result = await uploadImage(compressed, {
      folder: "phenom/avatars",
      public_id: publicId,
      maxWidth: 256,
      maxHeight: 256,
      quality: 85,
    });

    // Update the user
    user.avatar = {
      url: result.secure_url,
      publicId: result.public_id,
    };
    await user.save();

    console.log(
      `✅ Avatar uploadé pour l'utilisateur ${userId}: ${result.secure_url}`
    );

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  }

  /**
   * Deletes the user's avatar
   * @param {string} userId - User ID
   * @returns {boolean} true if deletion was successful
   */
  async deleteAvatar(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }

    if (!user.avatar?.publicId) {
      throw new Error("NO_AVATAR");
    }

    // Delete from Cloudinary
    try {
      await deleteImage(user.avatar.publicId);
      console.log(`🗑️ Avatar supprimé: ${user.avatar.publicId}`);
    } catch (error) {
      console.error(`⚠️ Erreur suppression avatar: ${error.message}`);
    }

    // Update the user
    user.avatar = {
      url: null,
      publicId: null,
    };
    await user.save();

    return true;
  }
}

export default new UserService();
