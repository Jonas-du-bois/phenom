import mongoose from 'mongoose';

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
  imageUrl: {
    type: String,
    default: null
  },
  images: [{
    imageId: {
      type: String,
      required: true
    },
    imageUrl: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    format: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved'
  },
  moderatedAt: {
    type: Date,
    default: null
  },
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  moderationNote: {
    type: String,
    default: null
  },
  flagged: {
    type: Boolean,
    default: false
  },
  flagReason: {
    type: String,
    default: null
  },
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
        validator: function(v) {
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
    required: [true, "L'ID utilisateur est requis"]
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index géospatial pour les recherches par proximité
observationSchema.index({ location: '2dsphere' });
observationSchema.index({ userId: 1, createdAt: -1 });
observationSchema.index({ createdAt: -1 });

// Index de recherche textuelle
observationSchema.index({ 
  title: 'text', 
  description: 'text' 
}, {
  weights: {
    title: 10,
    description: 5
  }
});

// Virtual pour le nombre de commentaires
observationSchema.virtual('commentsCount', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'observationId',
  count: true
});

const Observation = mongoose.model('Observation', observationSchema);

export default Observation;
