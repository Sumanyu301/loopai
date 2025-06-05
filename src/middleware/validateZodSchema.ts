import { Request, Response, NextFunction } from "express";
import { AnyZodObject } from "zod";
import { ApiError } from "../utils/errors";

export const validateZodSchema =
  (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      const err: any = error;
      next(ApiError.badRequest("Validation failed", err.error));
    }
  };
