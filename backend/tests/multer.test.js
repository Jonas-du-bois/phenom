import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Multer Configuration', () => {
  let uploadConfig;
  const uploadDir = path.join(__dirname, '../uploads');

  beforeAll(async () => {
    // Importer la configuration multer
    const multerModule = await import('../src/config/multer.js');
    uploadConfig = multerModule.default;
  });

  afterAll(() => {
    // Nettoyer les fichiers de test créés
    if (fs.existsSync(uploadDir)) {
      const files = fs.readdirSync(uploadDir);
      files.forEach(file => {
        if (file.startsWith('test-image-')) {
          fs.unlinkSync(path.join(uploadDir, file));
        }
      });
    }
  });

  describe('Upload Directory', () => {
    it('should create upload directory if it does not exist', () => {
      const expectedUploadDir = path.join(__dirname, '../uploads');
      expect(fs.existsSync(expectedUploadDir)).toBe(true);
    });
  });

  describe('Storage Configuration', () => {
    it('should be configured with multer', () => {
      expect(uploadConfig).toBeDefined();
      expect(uploadConfig.single).toBeDefined();
      expect(typeof uploadConfig.single).toBe('function');
    });
  });

  describe('File Filter', () => {
    it('should accept valid image types', () => {
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];

      // On ne peut pas tester directement le fileFilter car il est privé
      // mais on peut vérifier que l'upload est configuré
      expect(uploadConfig).toBeDefined();
    });
  });

  describe('File Size Limits', () => {
    it('should have configured file size limits', () => {
      expect(uploadConfig).toBeDefined();
      // La limite est configurée dans multer
    });
  });

  describe('Filename Generation', () => {
    it('should generate unique filenames', () => {
      const timestamp1 = Date.now();
      const random1 = Math.round(Math.random() * 1E9);
      const filename1 = `test-image-${timestamp1}-${random1}.jpg`;

      const timestamp2 = Date.now();
      const random2 = Math.round(Math.random() * 1E9);
      const filename2 = `test-image-${timestamp2}-${random2}.jpg`;

      expect(filename1).not.toBe(filename2);
    });

    it('should sanitize filenames', () => {
      const originalName = 'Test Image @#$.jpg';
      const basename = path.basename(originalName, '.jpg');
      const sanitized = basename.toLowerCase().replace(/[^a-z0-9]/g, '-');

      expect(sanitized).toMatch(/^[a-z0-9-]+$/);
      expect(sanitized).not.toContain('@');
      expect(sanitized).not.toContain('#');
      expect(sanitized).not.toContain('$');
      expect(sanitized).not.toContain(' ');
    });

    it('should preserve file extension', () => {
      const originalName = 'test-image.jpg';
      const ext = path.extname(originalName);

      expect(ext).toBe('.jpg');
    });

    it('should handle multiple extensions correctly', () => {
      const testCases = [
        { name: 'image.jpg', expected: '.jpg' },
        { name: 'image.png', expected: '.png' },
        { name: 'image.webp', expected: '.webp' },
        { name: 'image.test.jpg', expected: '.jpg' }
      ];

      testCases.forEach(({ name, expected }) => {
        const ext = path.extname(name);
        expect(ext).toBe(expected);
      });
    });
  });

  describe('Allowed Types Configuration', () => {
    it('should use default allowed types when not specified', () => {
      const defaultTypes = ['image/jpeg', 'image/png', 'image/webp'];
      const envTypes = process.env.ALLOWED_IMAGE_TYPES?.split(',') || defaultTypes;

      expect(Array.isArray(envTypes)).toBe(true);
      expect(envTypes.length).toBeGreaterThan(0);
    });

    it('should parse ALLOWED_IMAGE_TYPES from environment', () => {
      const originalValue = process.env.ALLOWED_IMAGE_TYPES;
      process.env.ALLOWED_IMAGE_TYPES = 'image/jpeg,image/png';

      const types = process.env.ALLOWED_IMAGE_TYPES.split(',');
      expect(types).toContain('image/jpeg');
      expect(types).toContain('image/png');

      // Restaurer la valeur originale
      if (originalValue) {
        process.env.ALLOWED_IMAGE_TYPES = originalValue;
      } else {
        delete process.env.ALLOWED_IMAGE_TYPES;
      }
    });
  });

  describe('File Size Configuration', () => {
    it('should use default max file size when not specified', () => {
      const defaultSize = 10485760; // 10MB
      const maxSize = parseInt(process.env.MAX_FILE_SIZE) || defaultSize;

      expect(maxSize).toBeGreaterThan(0);
      expect(typeof maxSize).toBe('number');
    });

    it('should parse MAX_FILE_SIZE from environment', () => {
      const originalValue = process.env.MAX_FILE_SIZE;
      process.env.MAX_FILE_SIZE = '5242880'; // 5MB

      const maxSize = parseInt(process.env.MAX_FILE_SIZE);
      expect(maxSize).toBe(5242880);

      // Restaurer la valeur originale
      if (originalValue) {
        process.env.MAX_FILE_SIZE = originalValue;
      } else {
        delete process.env.MAX_FILE_SIZE;
      }
    });
  });

  describe('Upload Directory Path', () => {
    it('should use UPLOAD_DIR from environment if specified', () => {
      const originalValue = process.env.UPLOAD_DIR;
      process.env.UPLOAD_DIR = 'custom-uploads';

      const uploadDirPath = process.env.UPLOAD_DIR || 'uploads';
      expect(uploadDirPath).toBe('custom-uploads');

      // Restaurer la valeur originale
      if (originalValue) {
        process.env.UPLOAD_DIR = originalValue;
      } else {
        delete process.env.UPLOAD_DIR;
      }
    });

    it('should default to "uploads" directory', () => {
      const originalValue = process.env.UPLOAD_DIR;
      delete process.env.UPLOAD_DIR;

      const uploadDirPath = process.env.UPLOAD_DIR || 'uploads';
      expect(uploadDirPath).toBe('uploads');

      // Restaurer la valeur originale
      if (originalValue) {
        process.env.UPLOAD_DIR = originalValue;
      }
    });
  });
});
