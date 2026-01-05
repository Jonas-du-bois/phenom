import { errorHandler, notFound } from "../src/middleware/errorHandler.js";

/**
 * Error Handler Middleware tests
 * Tests error handling for various error types (Mongoose, JWT, generic)
 */
describe("Error Handler Middleware", () => {
  let req, res, next;

  beforeEach(() => {
    // Mock Express request object
    req = {
      path: "/test",
      method: "GET",
    };
    // Mock Express response object with chainable methods
    res = {
      status: function (code) {
        this.statusCode = code;
        return this;
      },
      json: function (data) {
        this.body = data;
        return this;
      },
    };
    // Mock next function
    next = () => {};
  });

  describe("errorHandler", () => {
    it("should handle Mongoose ValidationError", () => {
      const err = {
        name: "ValidationError",
        message: "Validation failed",
        errors: {
          email: { message: "Email is required" },
          password: { message: "Password is required" },
        },
      };

      errorHandler(err, req, res, next);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe("Erreur de validation");
      expect(res.body.details).toHaveLength(2);
    });

    it("should handle duplicate key error (11000)", () => {
      const err = {
        code: 11000,
        message: "Duplicate key error",
        keyPattern: { email: 1 },
      };

      errorHandler(err, req, res, next);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain("email");
    });

    it("should handle Mongoose CastError", () => {
      const err = {
        name: "CastError",
        message: "Cast to ObjectId failed",
      };

      errorHandler(err, req, res, next);

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe("Ressource non trouvée");
    });

    it("should handle JsonWebTokenError", () => {
      const err = {
        name: "JsonWebTokenError",
        message: "Invalid token",
      };

      errorHandler(err, req, res, next);

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe("Token invalide");
    });

    it("should handle TokenExpiredError", () => {
      const err = {
        name: "TokenExpiredError",
        message: "Token expired",
      };

      errorHandler(err, req, res, next);

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe("Token expiré");
    });

    it("should handle generic 500 errors", () => {
      const err = {
        message: "Something went wrong",
        statusCode: undefined,
      };

      errorHandler(err, req, res, next);

      expect(res.statusCode).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  describe("notFound", () => {
    it("should handle 404 not found", () => {
      notFound(req, res);

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain("non trouvée");
    });
  });
});
