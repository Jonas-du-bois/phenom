import userService from '../services/user.service.js';
import {
  successResponse,
  errorResponse,
  notFoundResponse
} from '../utils/response.js';

/**
 * Controller for user management
 * Handles profile, password, avatar, and account operations
 */
class UserController {
  /**
   * Retrieves the logged-in user's profile
   * GET /users/me
   */
  async getProfile(req, res, next) {
    try {
      const userId = req.user._id;
      const profile = await userService.getProfile(userId);

      return successResponse(res, profile);
    } catch (error) {
      if (error.message === 'USER_NOT_FOUND') {
        return notFoundResponse(res, 'Utilisateur non trouvé');
      }
      next(error);
    }
  }

  /**
   * Retrieves the logged-in user's statistics
   * GET /users/me/stats
   */
  async getUserStats(req, res, next) {
    try {
      const userId = req.user._id;
      const stats = await userService.getUserStats(userId);

      return successResponse(res, stats);
    } catch (error) {
      if (error.message === 'USER_NOT_FOUND') {
        return notFoundResponse(res, 'Utilisateur non trouvé');
      }
      next(error);
    }
  }

  /**
   * Updates the logged-in user's profile
   * PUT /users/me
   */
  async updateProfile(req, res, next) {
    try {
      const userId = req.user._id;

      // Filter allowed fields (whitelist)
      // Ignore empty fields to allow partial updates
      const allowedFields = ['name', 'email', 'bio'];
      const updates = {};
      allowedFields.forEach((field) => {
        if (req.body[field] !== undefined && req.body[field] !== '') {
          updates[field] = req.body[field];
        }
      });

      // Verify that there is at least one field to update
      if (Object.keys(updates).length === 0) {
        return errorResponse(res, 'Aucun champ à mettre à jour', 400);
      }

      const user = await userService.updateProfile(userId, updates);

      return successResponse(res, user, 'Profil mis à jour avec succès');
    } catch (error) {
      if (error.message === 'USER_NOT_FOUND') {
        return notFoundResponse(res, 'Utilisateur non trouvé');
      }
      if (error.message === 'EMAIL_ALREADY_EXISTS') {
        return errorResponse(res, 'Cet email est déjà utilisé', 400);
      }
      next(error);
    }
  }

  /**
   * Changes the logged-in user's password
   * PATCH /users/me/password
   */
  async changePassword(req, res, next) {
    try {
      const userId = req.user._id;
      const { currentPassword, newPassword } = req.body;

      await userService.changePassword(userId, currentPassword, newPassword);

      return successResponse(res, null, 'Mot de passe modifié avec succès');
    } catch (error) {
      if (error.message === 'USER_NOT_FOUND') {
        return notFoundResponse(res, 'Utilisateur non trouvé');
      }
      if (error.message === 'INVALID_CURRENT_PASSWORD') {
        return errorResponse(res, 'Mot de passe actuel incorrect', 400);
      }
      if (error.message === 'NEW_PASSWORD_SAME_AS_CURRENT') {
        return errorResponse(
          res,
          'Le nouveau mot de passe doit être différent de l\'ancien',
          400
        );
      }
      next(error);
    }
  }

  /**
   * Deletes the logged-in user's account
   * DELETE /users/me
   */
  async deleteAccount(req, res, next) {
    try {
      const userId = req.user._id;
      await userService.deleteAccount(userId);

      return successResponse(res, {}, 'Compte supprimé avec succès');
    } catch (error) {
      if (error.message === 'USER_NOT_FOUND') {
        return notFoundResponse(res, 'Utilisateur non trouvé');
      }
      next(error);
    }
  }

  /**
   * Updates the user's current position
   * POST /users/me/location
   *
   * Creates persistent notifications for nearby observations.
   * Notifications are only created once per user+observation (no duplicates).
   * Push notifications are only sent if the notification is new.
   */
  async updateLocation(req, res, next) {
    try {
      const userId = req.user._id;
      const { lat, lng, radiusKm = 50 } = req.body;

      if (typeof lat !== 'number' || typeof lng !== 'number') {
        return errorResponse(
          res,
          'lat and lng are required and must be numbers',
          400
        );
      }

      // Store/update last location and radius on PushSubscription documents
      const PushSubscription = (await import('../models/PushSubscription.js'))
        .default;
      await PushSubscription.updateMany(
        { userId },
        {
          $set: {
            'lastLocation.lat': lat,
            'lastLocation.lng': lng,
            'lastLocation.updatedAt': new Date(),
            alertRadiusKm: radiusKm
          }
        }
      );

      // Import Notification model
      const Notification = (await import('../models/Notification.js')).default;
      const { NOTIFICATION_TYPES } = await import('../models/Notification.js');

      // Find nearby observations
      const Observation = (await import('../models/Observation.js')).default;

      let toNotify = [];
      try {
        const meters = Math.round(radiusKm * 1000);
        const agg = await Observation.aggregate([
          {
            $geoNear: {
              near: { type: 'Point', coordinates: [lng, lat] },
              distanceField: 'dist.calculated',
              maxDistance: meters,
              spherical: true
            }
          },
          { $limit: 200 }
        ]).allowDiskUse(true);

        toNotify = agg.map((doc) => ({
          obs: doc,
          distance: Math.round((doc.dist?.calculated || 0) / 100) / 10
        }));
      } catch (geoErr) {
        // Fallback to bounding box + haversine
        const deg = radiusKm / 111;
        const minLat = lat - deg;
        const maxLat = lat + deg;
        const minLng = lng - deg;
        const maxLng = lng + deg;

        const candidates = await Observation.find({
          'coordinates.lat': { $gte: minLat, $lte: maxLat },
          'coordinates.lng': { $gte: minLng, $lte: maxLng }
        })
          .limit(200)
          .lean();

        const toKm = (lat1, lon1, lat2, lon2) => {
          const toRad = (v) => (v * Math.PI) / 180;
          const R = 6371;
          const dLat = toRad(lat2 - lat1);
          const dLon = toRad(lon2 - lon1);
          const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) *
              Math.cos(toRad(lat2)) *
              Math.sin(dLon / 2) ** 2;
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          return R * c;
        };

        for (const obs of candidates) {
          if (!obs.coordinates || obs.coordinates.lat === undefined) continue;
          const d = toKm(lat, lng, obs.coordinates.lat, obs.coordinates.lng);
          if (d <= radiusKm)
            toNotify.push({ obs, distance: Math.round(d * 10) / 10 });
        }
      }

      // Import services for notifications
      const webpushService = (await import('../services/webpush.service.js'))
        .default;
      const { publishObservationEvent } = await import(
        '../config/websocket.js'
      );

      let newNotificationsCount = 0;

      // Process each nearby observation
      for (const item of toNotify) {
        const obs = item.obs;
        const obsId = obs._id;

        // Create notification only if it doesn't already exist (deduplication)
        const { notification, isNew } = await Notification.createIfNotExists({
          userId,
          observationId: obsId,
          type: NOTIFICATION_TYPES.OBSERVATION_NEARBY,
          title: obs.title || obs.phenomenonType || 'Observation proche',
          message: `Observation à ${item.distance} km de votre position`,
          distance: item.distance,
          userLocation: { lat, lng },
          observationLocation: {
            lat: obs.coordinates?.lat || obs.locationPoint?.coordinates?.[1],
            lng: obs.coordinates?.lng || obs.locationPoint?.coordinates?.[0]
          },
          observationSnapshot: {
            title: obs.title,
            phenomenonType: obs.phenomenonType,
            imageUrl: obs.images?.[0]?.url || obs.images?.[0],
            location: obs.location
          }
        });

        // Only send push notification if this is a NEW notification
        if (isNew) {
          newNotificationsCount++;

          // Publish WebSocket event for real-time UI update
          publishObservationEvent('observation:nearby', {
            ...obs,
            notificationId: notification._id,
            distance: item.distance
          });

          // Send WebPush (one notification per observation, never duplicated)
          try {
            await webpushService.notifyUserPush(userId, {
              title: `Observation à ${item.distance} km`,
              body: obs.title || obs.location || 'Nouvelle observation proche',
              tag: `observation-${obsId}`, // Same tag = replaces previous
              data: {
                url: `/observation/${obsId}`,
                observationId: obsId.toString(),
                notificationId: notification._id.toString()
              }
            });

            // Mark push as sent
            await Notification.findByIdAndUpdate(notification._id, {
              $set: { pushSentAt: new Date() }
            });
          } catch (pushErr) {
            console.warn('Failed to send push for observation:', obsId, pushErr.message);
          }
        }
      }

      return successResponse(res, {
        checked: toNotify.length,
        newNotifications: newNotificationsCount
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Retrieves the logged-in user's observations
   * GET /users/me/observations
   */
  async getUserObservations(req, res, next) {
    try {
      const userId = req.user._id;
      const result = await userService.getUserObservations(userId, req.query);

      return res.json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Uploads or updates the user's avatar
   * POST /users/me/avatar
   */
  async uploadAvatar(req, res, next) {
    try {
      const userId = req.user._id;

      if (!req.file) {
        return errorResponse(res, 'Aucune image fournie', 400);
      }

      const avatar = await userService.uploadAvatar(
        userId,
        req.file.buffer,
        req.file.mimetype
      );

      return successResponse(res, avatar, 'Avatar mis à jour avec succès');
    } catch (error) {
      if (error.message === 'USER_NOT_FOUND') {
        return notFoundResponse(res, 'Utilisateur non trouvé');
      }
      next(error);
    }
  }

  /**
   * Deletes the user's avatar
   * DELETE /users/me/avatar
   */
  async deleteAvatar(req, res, next) {
    try {
      const userId = req.user._id;
      await userService.deleteAvatar(userId);

      return successResponse(res, null, 'Avatar supprimé avec succès');
    } catch (error) {
      if (error.message === 'USER_NOT_FOUND') {
        return notFoundResponse(res, 'Utilisateur non trouvé');
      }
      if (error.message === 'NO_AVATAR') {
        return errorResponse(res, 'Aucun avatar à supprimer', 400);
      }
      next(error);
    }
  }
}

export default new UserController();
