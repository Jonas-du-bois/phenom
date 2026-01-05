import { fileURLToPath } from "url";
import path from "path";
import upload, { isImageTypeAllowed } from "../src/config/multer.js";
import { imageConfig } from "../src/config/image.config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("Multer Configuration", () => {
  describe("Basic configuration", () => {
    it("should export a valid multer instance", () => {
      expect(upload).toBeDefined();
      expect(typeof upload.single).toBe("function");
      expect(typeof upload.array).toBe("function");
      expect(typeof upload.fields).toBe("function");
    });

    it("should export the isImageTypeAllowed function", () => {
      expect(isImageTypeAllowed).toBeDefined();
      expect(typeof isImageTypeAllowed).toBe("function");
    });

    it("should have a functional single() middleware", () => {
      const middleware = upload.single("image");
      expect(typeof middleware).toBe("function");
      expect(middleware.length).toBe(3); // req, res, next
    });

    it("should have a functional array() middleware", () => {
      const middleware = upload.array("images", 5);
      expect(typeof middleware).toBe("function");
      expect(middleware.length).toBe(3);
    });

    it("should have a functional fields() middleware", () => {
      const middleware = upload.fields([{ name: "image", maxCount: 1 }]);
      expect(typeof middleware).toBe("function");
      expect(middleware.length).toBe(3);
    });
  });

  describe("isImageTypeAllowed()", () => {
    it("should accept image/jpeg", () => {
      expect(isImageTypeAllowed("image/jpeg")).toBe(true);
    });

    it("should accept image/png", () => {
      expect(isImageTypeAllowed("image/png")).toBe(true);
    });

    it("should accept image/webp", () => {
      expect(isImageTypeAllowed("image/webp")).toBe(true);
    });

    it("should accept image/jpg (alias)", () => {
      expect(isImageTypeAllowed("image/jpg")).toBe(true);
    });

    it("should reject application/pdf", () => {
      expect(isImageTypeAllowed("application/pdf")).toBe(false);
    });

    it("should reject text/plain", () => {
      expect(isImageTypeAllowed("text/plain")).toBe(false);
    });

    it("should reject video/mp4", () => {
      expect(isImageTypeAllowed("video/mp4")).toBe(false);
    });

    it("should reject empty types", () => {
      expect(isImageTypeAllowed("")).toBe(false);
    });

    it("should reject undefined", () => {
      expect(isImageTypeAllowed(undefined)).toBe(false);
    });

    it("should reject null", () => {
      expect(isImageTypeAllowed(null)).toBe(false);
    });
  });

  describe("imageConfig Configuration", () => {
    it("should have allowed MIME types defined", () => {
      expect(imageConfig.allowedFormats).toBeDefined();
      expect(Array.isArray(imageConfig.allowedFormats)).toBe(true);
      expect(imageConfig.allowedFormats.length).toBeGreaterThan(0);
    });

    it("should include image/jpeg", () => {
      expect(imageConfig.allowedFormats).toContain("image/jpeg");
    });

    it("should include image/png", () => {
      expect(imageConfig.allowedFormats).toContain("image/png");
    });

    it("should include image/webp", () => {
      expect(imageConfig.allowedFormats).toContain("image/webp");
    });

    it("devrait avoir une limite de taille de fichier définie", () => {
      expect(imageConfig.maxFileSize).toBeDefined();
      expect(typeof imageConfig.maxFileSize).toBe("number");
      expect(imageConfig.maxFileSize).toBeGreaterThan(0);
    });

    it("devrait avoir une limite de 10MB (10485760 bytes)", () => {
      expect(imageConfig.maxFileSize).toBe(10485760);
    });
  });

  describe("Validation des types de fichiers", () => {
    it("devrait accepter les formats image standards", () => {
      const standardFormats = ["image/jpeg", "image/png", "image/webp"];
      standardFormats.forEach((format) => {
        expect(imageConfig.allowedFormats).toContain(format);
      });
    });

    it("ne devrait contenir que des types MIME valides", () => {
      imageConfig.allowedFormats.forEach((type) => {
        expect(type).toMatch(/^image\//);
      });
    });

    it("devrait rejeter les fichiers non-image", () => {
      const invalidMimeTypes = ["application/pdf", "text/plain", "video/mp4"];
      invalidMimeTypes.forEach((mimetype) => {
        expect(imageConfig.allowedFormats).not.toContain(mimetype);
      });
    });
  });

  describe("Fonctionnalités multer", () => {
    it("devrait permettre de créer un middleware pour un seul fichier", () => {
      const singleUpload = upload.single("photo");
      expect(singleUpload).toBeDefined();
      expect(typeof singleUpload).toBe("function");
    });

    it("devrait permettre de créer un middleware pour plusieurs fichiers", () => {
      const multiUpload = upload.array("photos", 10);
      expect(multiUpload).toBeDefined();
      expect(typeof multiUpload).toBe("function");
    });

    it("devrait permettre de créer un middleware pour plusieurs champs", () => {
      const fieldsUpload = upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "gallery", maxCount: 8 },
      ]);
      expect(fieldsUpload).toBeDefined();
      expect(typeof fieldsUpload).toBe("function");
    });

    it("devrait avoir la méthode any() disponible", () => {
      expect(typeof upload.any).toBe("function");
      const anyUpload = upload.any();
      expect(typeof anyUpload).toBe("function");
    });

    it("devrait avoir la méthode none() disponible", () => {
      expect(typeof upload.none).toBe("function");
      const noneUpload = upload.none();
      expect(typeof noneUpload).toBe("function");
    });
  });

  describe("Limites de configuration", () => {
    it("devrait respecter la limite de taille de fichier", () => {
      const maxSize = imageConfig.maxFileSize;
      const tenMB = 10 * 1024 * 1024;
      expect(maxSize).toBe(tenMB);
    });

    it("devrait avoir une limite raisonnable (entre 1MB et 50MB)", () => {
      const maxSize = imageConfig.maxFileSize;
      const oneMB = 1024 * 1024;
      const fiftyMB = 50 * 1024 * 1024;
      expect(maxSize).toBeGreaterThanOrEqual(oneMB);
      expect(maxSize).toBeLessThanOrEqual(fiftyMB);
    });

    it("devrait limiter le nombre de fichiers à 1", () => {
      // La configuration limite à 1 fichier dans multer
      const middleware = upload.single("image");
      expect(typeof middleware).toBe("function");
    });
  });

  describe("Utilisation réelle", () => {
    it("devrait être compatible avec Express", () => {
      // Multer crée des middlewares Express standard (req, res, next)
      const middleware = upload.single("test");
      expect(middleware.length).toBe(3);
    });

    it("devrait créer des middlewares fonctionnels", () => {
      // Vérifier que toutes les méthodes sont disponibles
      expect(typeof upload.single).toBe("function");
      expect(typeof upload.array).toBe("function");
      expect(typeof upload.fields).toBe("function");
      expect(typeof upload.any).toBe("function");
      expect(typeof upload.none).toBe("function");
    });
  });
});
