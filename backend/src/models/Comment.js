import mongoose from 'mongoose';

/**
 * @file Comment.js
 * @description Mongoose model for Comment entity.
 * Represents user comments on observations.
 */

const commentSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'Le texte du commentaire est requis'],
    trim: true,
    minlength: [1, 'Le commentaire doit contenir au moins 1 caractère'],
    maxlength: [500, 'Le commentaire ne peut pas dépasser 500 caractères']
  },
  observationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Observation',
    required: [true, 'L\'ID de l\'observation est requis']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'L\'ID utilisateur est requis']
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
  timestamps: true
});

// Indexes for query optimization
commentSchema.index({ observationId: 1, createdAt: -1 }); // Get comments for an observation, sorted by date
commentSchema.index({ userId: 1 }); // Get comments by user
commentSchema.index({ createdAt: -1 }); // Get latest comments globally

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;
