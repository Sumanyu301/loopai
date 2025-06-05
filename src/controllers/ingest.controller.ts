import { Request, Response } from "express";
import { ApiError } from "../utils/errors";
import logger from "../utils/logger";

export const ingestData = async (req: Request, res: Response) => {
  try {
    const { data, source, timestamp = new Date().toISOString() } = req.body;

    // Log the incoming request
    logger.info("Ingesting data:", {
      source,
      timestamp,
      dataSize: JSON.stringify(data).length,
    });

    // Here you would typically process and store the data
    // For example: await database.insert({ data, source, timestamp });

    // For now, we'll just simulate processing
    await new Promise((resolve) => setTimeout(resolve, 100));

    return res.status(201).json({
      success: true,
      message: "Data ingested successfully",
      metadata: {
        source,
        timestamp,
        receivedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error("Error ingesting data:", error);
    throw ApiError.internal("Failed to process ingest request");
  }
};
