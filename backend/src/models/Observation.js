import mongoose from 'mongoose';

/**
 * @file Observation.js
 * @description Mongoose model for Observation/Sighting entity.
 * Format compatible with Phenom Search API (Hatch UFO Database format).
 * Stores UFO/Phenomenon sightings with social features (images, comments, users).
 */

// Observer type codes
const OBSERVER_TYPES = ['GND', 'MIL', 'CIV', 'HQO', 'SCI', 'CST', 'SEA', 'NWS'];

// UFO shape codes
const UFO_SHAPES = ['SCR', 'CIG', 'DLT', 'NLT', 'FBL', 'FIG', 'PRB', 'NFO'];

// Phenomenon codes
const PHENOMENA = [
  'WAV', 'TCH', 'HST', 'SND', 'ODD', 'MID', 'RAY', 'SIG', 'LND', 'SUB',
  'OBS', 'VEH', 'TRC', 'DRT', 'VEG', 'PHT', 'RDA', 'BLD', 'OID', 'NOC',
  'ANI', 'HUM', 'INJ'
];

// Locale types
const LOCALE_TYPES = [
  'Town & City', 'Rural', 'Mountains', 'Farmlands', 'Coastal',
  'Desert', 'Forest', 'Lake/River', 'Ocean', 'Airport', 'Military Base', 'Unknown'
];

const observationSchema = new mongoose.Schema({
  // === Phenom Search compatible fields ===

  date: {
    type: String,
    required: [true, 'La date est requise'],
    trim: true,
    comment: 'Date string format (e.g., "6/24/1947", "2024-01-15")'
  },
  time: {
    type: String,
    default: 'Unknown',
    trim: true,
    comment: 'Time of sighting (e.g., "15:00", "Unknown")'
  },
  location: {
    type: String,
    required: [true, 'Le lieu est requis'],
    trim: true,
    maxlength: [200, 'Le lieu ne peut pas dépasser 200 caractères'],
    comment: 'Location name (e.g., "PARIS, FRANCE")'
  },
  country: {
    type: String,
    required: [true, 'Le pays est requis'],
    trim: true,
    maxlength: [100, 'Le pays ne peut pas dépasser 100 caractères']
  },
  state: {
    type: String,
    trim: true,
    maxlength: [100, 'La région ne peut pas dépasser 100 caractères'],
    comment: 'State/Province/Region'
  },
  description: {
    type: String,
    required: [true, 'La description est requise'],
    trim: true,
    minlength: [10, 'La description doit contenir au moins 10 caractères'],
    maxlength: [5000, 'La description ne peut pas dépasser 5000 caractères']
  },
  credibility: {
    type: Number,
    min: [0, 'La crédibilité doit être entre 0 et 15'],
    max: [15, 'La crédibilité doit être entre 0 et 15'],
    default: 5,
    comment: 'Credibility score (0-15): quality of witnesses/evidence'
  },
  strangeness: {
    type: Number,
    min: [0, 'L\'étrangeté doit être entre 0 et 10'],
    max: [10, 'L\'étrangeté doit être entre 0 et 10'],
    default: 5,
    comment: 'Strangeness score (0-10): degree of unusualness'
  },
  duration: {
    type: Number,
    min: [0, 'La durée doit être positive'],
    default: 0,
    comment: 'Duration in seconds'
  },
  locale: {
    type: String,
    enum: LOCALE_TYPES,
    default: 'Unknown',
    comment: 'Type of location'
  },
  coordinates: {
    lat: {
      type: Number,
      min: -90,
      max: 90,
      comment: 'Latitude (WGS84)'
    },
    lng: {
      type: Number,
      min: -180,
      max: 180,
      comment: 'Longitude (WGS84)'
    }
  },
  // GeoJSON point for efficient geospatial queries (optional, populated when available)
  // NOTE: This field should only be set when coordinates are available.
  // Do NOT set default values here - it will break the 2dsphere index.
  locationPoint: {
    type: {
      type: String,
      enum: ['Point']
      // No default - locationPoint should be undefined when no coordinates
    },
    coordinates: {
      type: [Number] // [lng, lat]
      // No default - must have valid coordinates for GeoJSON
    }
  },
  observerTypes: {
    type: [String],
    enum: OBSERVER_TYPES,
    default: ['CIV'],
    comment: 'Types of observers (GND=Ground, MIL=Military, CIV=Civilian, etc.)'
  },
  ufoShapes: {
    type: [String],
    enum: UFO_SHAPES,
    default: [],
    comment: 'Shapes observed (SCR=Saucer, CIG=Cigar, DLT=Delta, etc.)'
  },
  phenomena: {
    type: [String],
    enum: PHENOMENA,
    default: [],
    comment: 'Associated phenomena codes'
  },

  // === Phenom App specific fields (social features) ===

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
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'L\'ID utilisateur est requis']
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
  },

  // === Metadata ===
  source: {
    type: String,
    default: 'phenom-app',
    enum: ['phenom-app', 'hatch-ufo', 'import', 'seed'],
    comment: 'Data source identifier'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient queries
observationSchema.index({ country: 1 });
observationSchema.index({ date: 1 });
observationSchema.index({ credibility: 1 });
observationSchema.index({ strangeness: 1 });
observationSchema.index({ locale: 1 });
observationSchema.index({ observerTypes: 1 });
observationSchema.index({ ufoShapes: 1 });
observationSchema.index({ phenomena: 1 });
observationSchema.index({ userId: 1, createdAt: -1 });
observationSchema.index({ createdAt: -1 });
observationSchema.index({ tags: 1 });

// Geospatial index for proximity searches (sparse for optional coordinates)
observationSchema.index({ 'coordinates.lat': 1, 'coordinates.lng': 1 }, { sparse: true });
// 2dsphere index for GeoJSON point
observationSchema.index({ locationPoint: '2dsphere' }, { sparse: true });

/**
 * Pre-save middleware to handle locationPoint GeoJSON field.
 * Only populates locationPoint when valid coordinates are provided.
 * This prevents MongoDB 2dsphere index errors when coordinates are missing.
 */
observationSchema.pre('save', function(next) {
  // Check if we have valid coordinates
  if (this.coordinates && 
      typeof this.coordinates.lat === 'number' && 
      typeof this.coordinates.lng === 'number' &&
      !isNaN(this.coordinates.lat) && 
      !isNaN(this.coordinates.lng)) {
    // Set locationPoint for geospatial queries
    this.locationPoint = {
      type: 'Point',
      coordinates: [this.coordinates.lng, this.coordinates.lat] // GeoJSON format: [lng, lat]
    };
  } else {
    // Clear locationPoint if no valid coordinates
    this.locationPoint = undefined;
  }
  next();
});

/**
 * Pre-findOneAndUpdate middleware to handle locationPoint on updates.
 */
observationSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate();
  
  // Handle $set operations
  const setData = update.$set || update;
  
  if (setData.coordinates) {
    const coords = setData.coordinates;
    if (typeof coords.lat === 'number' && 
        typeof coords.lng === 'number' &&
        !isNaN(coords.lat) && 
        !isNaN(coords.lng)) {
      // Set locationPoint
      if (update.$set) {
        update.$set.locationPoint = {
          type: 'Point',
          coordinates: [coords.lng, coords.lat]
        };
      } else {
        update.locationPoint = {
          type: 'Point',
          coordinates: [coords.lng, coords.lat]
        };
      }
    }
  }
  
  next();
});

// Text search index
observationSchema.index({
  location: 'text',
  description: 'text',
  tags: 'text',
  country: 'text'
}, {
  weights: {
    location: 10,
    country: 8,
    description: 5,
    tags: 3
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

// Virtual: check if observation has coordinates
observationSchema.virtual('hasCoordinates').get(function () {
  return this.coordinates &&
         this.coordinates.lat !== undefined &&
         this.coordinates.lng !== undefined;
});

// Virtual: check if observation has images
observationSchema.virtual('hasImages').get(function () {
  return this.images && this.images.length > 0;
});

// Virtual: get image URLs array
observationSchema.virtual('imageUrls').get(function () {
  return this.images ? this.images.map(img => img.url) : [];
});

// Transform _id to id for Phenom Search compatibility
observationSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    ret.id = ret._id.toString();
    delete ret.__v;
    return ret;
  }
});

const Observation = mongoose.model('Observation', observationSchema);

// Export constants for use in validators
export { OBSERVER_TYPES, UFO_SHAPES, PHENOMENA, LOCALE_TYPES };

export default Observation;
