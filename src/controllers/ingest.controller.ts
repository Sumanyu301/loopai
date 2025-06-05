import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/errors";
import logger from "../utils/logger";
import { IngestData } from "../schemas/ingest.schema";
import JobQueue from "../services/jobQueue.service";
import { generateIngestionId } from "../utils/idGenerator";

export const ingestData = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { ids, priority } = req.body as IngestData;
    const ingestionId = generateIngestionId();
    const createdAt = new Date();

    // Log the incoming request
    logger.info("Received ingest request:", {
      ingestionId,
      numberOfIds: ids.length,
      priority,
      timestamp: createdAt.toISOString(),
    });

    // Add job to queue
    JobQueue.getInstance().addJob({
      ids,
      priority,
      ingestionId,
      createdAt,
    });

    // Return immediately with ingestion ID
    res.status(202).json({
      ingestion_id: ingestionId,
    });
  } catch (error) {
    logger.error("Error ingesting data:", error);
    next(ApiError.internal("Failed to process ingest request"));
  }
};
