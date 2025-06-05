import { Router } from "express";
import { ingestData } from "../controllers/ingest.controller";
import { validateZodSchema } from "../middleware/validateZodSchema";
import { ingestSchema } from "../schemas/ingest.schema";

const router = Router();

router.post("/", validateZodSchema(ingestSchema), ingestData);

export default router;
