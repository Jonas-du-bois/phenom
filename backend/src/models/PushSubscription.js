import mongoose from 'mongoose';

const pushSubscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  subscription: {
    type: Object,
    required: true
  },
  lastLocation: {
    lat: { type: Number },
    lng: { type: Number },
    updatedAt: { type: Date }
  },
  createdAt: { type: Date, default: Date.now }
});

pushSubscriptionSchema.index({ 'lastLocation.lat': 1, 'lastLocation.lng': 1 });

const PushSubscription = mongoose.model('PushSubscription', pushSubscriptionSchema);
export default PushSubscription;
