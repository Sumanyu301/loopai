import { Router } from "express";
import { getJobStatus } from "../controllers/status.controller";

const router = Router();

// The route should be relative since we already have /api/v1 prefix in app.ts
router.get("/:ingestionId", getJobStatus);

export default router;
