import mongoose from 'mongoose';

/**
 * @file Observation.js
 * @description Mongoose model for Observation entity.
 * Stores data about UFO/Phenomenon observations, including geolocation, images, and description.
 */

const observationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Le titre est requis'],
    trim: true,
    minlength: [3, 'Le titre doit contenir au moins 3 caractères'],
    maxlength: [100, 'Le titre ne peut pas dépasser 100 caractères']
  },
  description: {
    type: String,
    required: [true, 'La description est requise'],
    trim: true,
    minlength: [10, 'La description doit contenir au moins 10 caractères'],
    maxlength: [2000, 'La description ne peut pas dépasser 2000 caractères']
  },
  images: [{
    publicId: {
      type: String,
      required: true,
      comment: 'Cloudinary public_id or unique identifier'
    },
    url: {
      type: String,
      required: true,
      comment: 'Full URL (HTTPS)'
    },
    size: {
      type: Number,
      required: true,
      comment: 'Size in bytes'
    },
    format: {
      type: String,
      required: true,
      comment: 'Format (jpeg, png, webp...)'
    },
    width: {
      type: Number,
      comment: 'Width in pixels'
    },
    height: {
      type: Number,
      comment: 'Height in pixels'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    source: {
      type: String,
      enum: ['user', 'ai'],
      default: 'user',
      comment: 'Origin of the image: user upload or AI-generated'
    }
  }],
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
      required: true
    },
    coordinates: {
      type: [Number],
      required: [true, 'Les coordonnées sont requises'],
      validate: {
        validator: function (v) {
          return v.length === 2 &&
                 v[0] >= -180 && v[0] <= 180 && // longitude
                 v[1] >= -90 && v[1] <= 90;     // latitude
        },
        message: 'Coordonnées invalides. Format: [longitude, latitude]'
      }
    }
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'L\'ID utilisateur est requis']
  },
  date: {
    type: Date,
    default: Date.now
  },
  type: {
    type: String,
    enum: [
      'WAV', 'TCH', 'HST', 'SND', 'ODD', 'LND', 'SUB', 'OBS', 'RAY', 'SIG',
      'ANI', 'HUM', 'INJ', 'VEH', 'BLD', 'DRT', 'VEG', 'PHT', 'RDA', 'TRC',
      'NOC', 'CMF', 'MID', 'CNT', 'OID', 'COV', 'OGA'
    ],
    required: false
  },
  tags: {
    type: [String],
    default: [],
    validate: {
      validator: function (tags) {
        return tags.every(tag => tag.length >= 2 && tag.length <= 30);
      },
      message: 'Chaque tag doit contenir entre 2 et 30 caractères'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Geospatial index for proximity searches
observationSchema.index({ location: '2dsphere' });
observationSchema.index({ userId: 1, createdAt: -1 });
observationSchema.index({ createdAt: -1 });
observationSchema.index({ type: 1 });
observationSchema.index({ tags: 1 });

// Text search index
observationSchema.index({
  title: 'text',
  description: 'text',
  tags: 'text'
}, {
  weights: {
    title: 10,
    description: 5,
    tags: 8
  }
});

// Virtual property for the number of comments
observationSchema.virtual('commentsCount', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'observationId',
  count: true
});

// Virtual property for the list of comments
observationSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'observationId'
});

const Observation = mongoose.model('Observation', observationSchema);

export default Observation;
