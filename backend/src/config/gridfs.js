import mongoose from 'mongoose';
import { GridFSBucket } from 'mongodb';

let bucket;

/**
 * Initialise GridFS bucket pour le stockage des images
 */
export const initGridFS = () => {
  if (!mongoose.connection.db) {
    throw new Error('MongoDB doit être connecté avant d\'initialiser GridFS');
  }

  bucket = new GridFSBucket(mongoose.connection.db, {
    bucketName: 'images' // Collection: images.files et images.chunks
  });

  console.log('📦 GridFS initialisé pour le stockage d\'images');
  return bucket;
};

/**
 * Récupère le bucket GridFS
 */
export const getGridFSBucket = () => {
  if (!bucket) {
    throw new Error('GridFS n\'est pas initialisé. Appelez initGridFS() d\'abord.');
  }
  return bucket;
};

export default { initGridFS, getGridFSBucket };
