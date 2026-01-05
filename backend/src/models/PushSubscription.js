import mongoose from "mongoose";

/**
 * @file PushSubscription.js
 * @description Mongoose model for Web Push subscriptions.
 * Stores user push notification subscriptions for real-time alerts.
 */

/**
 * Schema for storing Web Push subscriptions
 * Each subscription is linked to a user and contains:
 * - The push subscription object (endpoint, keys)
 * - Optional last known location for proximity-based notifications
 */
const pushSubscriptionSchema = new mongoose.Schema({
  // Reference to the user who owns this subscription
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  // Web Push subscription object containing endpoint and encryption keys
  subscription: {
    type: Object,
    required: true,
  },
  // Last known location for proximity-based push notifications
  lastLocation: {
    lat: { type: Number },
    lng: { type: Number },
    updatedAt: { type: Date },
  },
  createdAt: { type: Date, default: Date.now },
});

// Geospatial index for proximity queries on user locations
pushSubscriptionSchema.index({ "lastLocation.lat": 1, "lastLocation.lng": 1 });

const PushSubscription = mongoose.model(
  "PushSubscription",
  pushSubscriptionSchema
);
export default PushSubscription;
