import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration du dossier d'uploads
const uploadDir = path.join(__dirname, '../../', process.env.UPLOAD_DIR || 'uploads');

// Créer le dossier uploads s'il n'existe pas
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`📁 Dossier uploads créé: ${uploadDir}`);
}

// Configuration du stockage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Générer un nom unique pour éviter les collisions
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-'); // Sanitize filename
    cb(null, `${basename}-${uniqueSuffix}${ext}`);
  }
});

// Filtre pour les types de fichiers
const fileFilter = (req, file, cb) => {
  const allowedTypes = process.env.ALLOWED_IMAGE_TYPES?.split(',') || [
    'image/jpeg',
    'image/png',
    'image/webp'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Type de fichier non autorisé. Types acceptés: ${allowedTypes.join(', ')}`), false);
  }
};

// Configuration de multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760, // 10MB par défaut
    files: 1 // 1 fichier à la fois
  }
});

// Log de la configuration au démarrage
console.log('📤 Upload configuré:');
console.log(`   Dossier: ${uploadDir}`);
console.log(`   Taille max: ${(parseInt(process.env.MAX_FILE_SIZE) || 10485760) / 1048576}MB`);
console.log(`   Types autorisés: ${process.env.ALLOWED_IMAGE_TYPES || 'image/jpeg,image/png,image/webp'}`);

export default upload;
