import mongoose from 'mongoose';

/**
 * @file Notification.js
 * @description Mongoose model for user notifications/alerts.
 * Stores persistent notifications for observations, with read/viewed tracking.
 * Implements 30-day auto-cleanup via TTL index.
 */

/**
 * Notification types enum
 */
export const NOTIFICATION_TYPES = {
  OBSERVATION_NEARBY: 'observation_nearby',
  OBSERVATION_NEW: 'observation_new',
  COMMENT_REPLY: 'comment_reply',
  SYSTEM: 'system'
};

/**
 * Schema for storing user notifications
 */
const notificationSchema = new mongoose.Schema({
  // Reference to the user who receives this notification
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Reference to the observation (optional, for observation-related notifications)
  observationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Observation',
    index: true
  },

  // Type of notification
  type: {
    type: String,
    enum: Object.values(NOTIFICATION_TYPES),
    default: NOTIFICATION_TYPES.OBSERVATION_NEARBY,
    required: true
  },

  // Notification title
  title: {
    type: String,
    required: true,
    maxlength: 200
  },

  // Notification message/body
  message: {
    type: String,
    required: true,
    maxlength: 500
  },

  // Distance from user when notification was created (in km)
  distance: {
    type: Number,
    min: 0
  },

  // User's location when notification was created
  userLocation: {
    lat: { type: Number },
    lng: { type: Number }
  },

  // Observation location for display purposes
  observationLocation: {
    lat: { type: Number },
    lng: { type: Number }
  },

  // Whether the user has seen/opened the notification
  read: {
    type: Boolean,
    default: false,
    index: true
  },

  // When the user viewed/clicked the notification
  viewedAt: {
    type: Date,
    default: null
  },

  // When the push notification was sent (null if not sent yet)
  pushSentAt: {
    type: Date,
    default: null
  },

  // Observation snapshot for display (denormalized data)
  observationSnapshot: {
    title: String,
    phenomenonType: String,
    imageUrl: String,
    location: String
  },

  // Creation timestamp (used for TTL - index is defined below with expireAfterSeconds)
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound unique index to prevent duplicate notifications for same user+observation
// This ensures a user only receives ONE notification per observation
notificationSchema.index(
  { userId: 1, observationId: 1 },
  { unique: true, sparse: true, partialFilterExpression: { observationId: { $exists: true } } }
);

// TTL index for automatic cleanup after 30 days
// MongoDB will automatically delete documents 30 days after createdAt
notificationSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 30 * 24 * 60 * 60 } // 30 days in seconds
);

// Index for efficient queries on unread notifications
notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

/**
 * Static method to get unread count for a user
 */
notificationSchema.statics.getUnreadCount = async function (userId) {
  return this.countDocuments({ userId, read: false });
};

/**
 * Static method to mark all notifications as read for a user
 */
notificationSchema.statics.markAllAsRead = async function (userId) {
  const now = new Date();
  return this.updateMany(
    { userId, read: false },
    { $set: { read: true, viewedAt: now } }
  );
};

/**
 * Static method to check if notification already exists for user+observation
 * Returns the existing notification if found, null otherwise
 */
notificationSchema.statics.findExisting = async function (userId, observationId) {
  if (!observationId) return null;
  return this.findOne({ userId, observationId });
};

/**
 * Static method to create notification only if it doesn't exist (upsert)
 * Returns { notification, isNew } where isNew is true if a new doc was created
 */
notificationSchema.statics.createIfNotExists = async function (data) {
  if (!data.observationId) {
    // No observationId = always create (e.g., system notifications)
    const notification = await this.create(data);
    return { notification, isNew: true };
  }

  // Try to find existing
  const existing = await this.findOne({
    userId: data.userId,
    observationId: data.observationId
  });

  if (existing) {
    return { notification: existing, isNew: false };
  }

  // Create new
  try {
    const notification = await this.create(data);
    return { notification, isNew: true };
  } catch (err) {
    // Handle race condition (duplicate key error)
    if (err.code === 11000) {
      const existing = await this.findOne({
        userId: data.userId,
        observationId: data.observationId
      });
      return { notification: existing, isNew: false };
    }
    throw err;
  }
};

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
