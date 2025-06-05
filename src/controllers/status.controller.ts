import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/errors";
import JobQueue from "../services/jobQueue.service";

export const getJobStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { ingestionId } = req.params;
    const status = JobQueue.getInstance().getJobStatus(ingestionId);

    if (!status) {
      next(ApiError.notFound(`No job found with ingestion ID: ${ingestionId}`));
      return;
    }

    res.status(200).json(status);
  } catch (error) {
    next(ApiError.internal("Failed to fetch job status"));
  }
};
