import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { ApiError } from "../utils/errors";
import logger from "../utils/logger";

// Extend Express Request type to include our custom properties
declare global {
  namespace Express {
    interface Request {
      id?: string;
    }
  }
}

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
): void => {
  if (err instanceof ApiError) {
    logger.error("API Error:", {
      path: req.path,
      statusCode: err.statusCode,
      message: err.message,
      errors: err.errors,
    });

    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
    });
  } else {
    logger.error("Unhandled Error:", {
      path: req.path,
      error: err.message,
      stack: err.stack,
    });

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
