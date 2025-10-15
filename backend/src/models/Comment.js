import mongoose from 'mongoose';

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
    required: [true, "L'ID de l'observation est requis"]
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
  timestamps: true
});

// Index pour optimiser les requêtes
commentSchema.index({ observationId: 1, createdAt: -1 });
commentSchema.index({ userId: 1 });
commentSchema.index({ createdAt: -1 });

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;
