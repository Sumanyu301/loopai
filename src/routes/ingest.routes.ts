import { Router } from "express";
import { body } from "express-validator";
import { ingestData } from "../controllers/ingest.controller";
import { validateRequest } from "../middleware";

const router = Router();

router.post(
  "/ingest",
  [
    body("data").exists().withMessage("Data is required"),
    body("source").isString().notEmpty().withMessage("Source is required"),
    body("timestamp")
      .optional()
      .isISO8601()
      .withMessage("Timestamp must be a valid ISO 8601 date"),
  ],
  validateRequest,
  ingestData
);

export default router;
