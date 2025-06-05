import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { ApiError } from "../utils/errors";
import logger from "../utils/logger";

export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw ApiError.badRequest("Validation error", errors.array());
  }
  next();
};

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof ApiError) {
    logger.error("API Error:", {
      path: req.path,
      statusCode: err.statusCode,
      message: err.message,
      errors: err.errors,
    });

    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
    });
  }

  logger.error("Unhandled Error:", {
    path: req.path,
    error: err.message,
    stack: err.stack,
  });

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};
