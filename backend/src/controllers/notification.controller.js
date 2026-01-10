import Notification from '../models/Notification.js';
import {
  successResponse,
  notFoundResponse
} from '../utils/response.js';

/**
 * Controller for notification management
 * Handles fetching, marking as read, and deleting notifications
 */
class NotificationController {
  /**
   * Get all notifications for the logged-in user
   * GET /notifications
   * Query params: page, limit, unreadOnly
   */
  async getNotifications(req, res, next) {
    try {
      const userId = req.user._id;
      const {
        page = 1,
        limit = 50,
        unreadOnly = false
      } = req.query;

      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
      const skip = (pageNum - 1) * limitNum;

      // Build query
      const query = { userId };
      if (unreadOnly === 'true' || unreadOnly === true) {
        query.read = false;
      }

      // Fetch notifications with pagination
      const [notifications, total, unreadCount] = await Promise.all([
        Notification.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum)
          .populate('observationId', 'title phenomenonType images location coordinates')
          .lean(),
        Notification.countDocuments(query),
        Notification.getUnreadCount(userId)
      ]);

      // Transform for frontend
      const transformed = notifications.map(n => ({
        id: n._id,
        type: n.type,
        title: n.title,
        message: n.message,
        distance: n.distance,
        read: n.read,
        viewedAt: n.viewedAt,
        createdAt: n.createdAt,
        observation: n.observationId ? {
          _id: n.observationId._id,
          title: n.observationId.title || n.observationSnapshot?.title,
          phenomenonType: n.observationId.phenomenonType || n.observationSnapshot?.phenomenonType,
          imageUrl: n.observationId.images?.[0]?.url || n.observationSnapshot?.imageUrl,
          location: n.observationId.location || n.observationSnapshot?.location
        } : n.observationSnapshot ? {
          _id: n.observationId,
          ...n.observationSnapshot
        } : null
      }));

      return successResponse(res, {
        notifications: transformed,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        },
        unreadCount
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get unread count for the logged-in user
   * GET /notifications/unread-count
   */
  async getUnreadCount(req, res, next) {
    try {
      const userId = req.user._id;
      const count = await Notification.getUnreadCount(userId);
      return successResponse(res, { count });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark a single notification as read
   * PATCH /notifications/:id/read
   */
  async markAsRead(req, res, next) {
    try {
      const userId = req.user._id;
      const { id } = req.params;

      const notification = await Notification.findOneAndUpdate(
        { _id: id, userId },
        {
          $set: {
            read: true,
            viewedAt: new Date()
          }
        },
        { new: true }
      );

      if (!notification) {
        return notFoundResponse(res, 'Notification non trouvée');
      }

      return successResponse(res, {
        id: notification._id,
        read: notification.read,
        viewedAt: notification.viewedAt
      }, 'Notification marquée comme lue');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark all notifications as read for the logged-in user
   * POST /notifications/mark-all-read
   */
  async markAllAsRead(req, res, next) {
    try {
      const userId = req.user._id;
      const result = await Notification.markAllAsRead(userId);

      return successResponse(res, {
        modifiedCount: result.modifiedCount
      }, 'Toutes les notifications marquées comme lues');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a single notification
   * DELETE /notifications/:id
   */
  async deleteNotification(req, res, next) {
    try {
      const userId = req.user._id;
      const { id } = req.params;

      const notification = await Notification.findOneAndDelete({
        _id: id,
        userId
      });

      if (!notification) {
        return notFoundResponse(res, 'Notification non trouvée');
      }

      return successResponse(res, null, 'Notification supprimée');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete all read notifications for the logged-in user
   * DELETE /notifications/read
   */
  async deleteAllRead(req, res, next) {
    try {
      const userId = req.user._id;
      const result = await Notification.deleteMany({
        userId,
        read: true
      });

      return successResponse(res, {
        deletedCount: result.deletedCount
      }, 'Notifications lues supprimées');
    } catch (error) {
      next(error);
    }
  }
}

export default new NotificationController();
