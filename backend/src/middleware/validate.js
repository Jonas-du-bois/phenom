import { validationResult } from "express-validator";

/**
 * Data validation middleware
 * Checks express-validator results and returns formatted errors
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((error) => ({
      field: error.path || error.param,
      message: error.msg,
    }));

    return res.status(400).json({
      success: false,
      error: "Validation échouée",
      details: formattedErrors,
    });
  }

  next();
};
