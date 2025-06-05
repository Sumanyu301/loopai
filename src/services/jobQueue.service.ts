import { Priority } from "../schemas/ingest.schema";
import logger from "../utils/logger";
import crypto from "crypto";

export type BatchStatus = "yet_to_start" | "triggered" | "completed";
export type JobStatus = BatchStatus;

interface Batch {
  batchId: string;
  ids: number[];
  status: BatchStatus;
}

export interface Job {
  ids: number[];
  priority: (typeof Priority)[keyof typeof Priority];
  ingestionId: string;
  createdAt: Date;
  batches: Batch[];
}

interface ProcessedData {
  id: number;
  data: string;
}

export interface JobStatusResponse {
  ingestion_id: string;
  status: JobStatus;
  batches: {
    batch_id: string;
    ids: number[];
    status: BatchStatus;
  }[];
}

class JobQueue {
  private queue: Job[] = [];
  private isProcessing: boolean = false;
  private lastProcessedTime: number = 0;
  private static instance: JobQueue;
  private batchSize: number = 3;
  private rateLimit: number = 5000; // 5 seconds
  private jobStatusMap: Map<string, Job> = new Map();

  private constructor() {}

  public static getInstance(): JobQueue {
    if (!JobQueue.instance) {
      JobQueue.instance = new JobQueue();
    }
    return JobQueue.instance;
  }

  private generateBatchId(): string {
    return crypto.randomBytes(8).toString("hex");
  }

  public addJob(job: Omit<Job, "batches">): void {
    // Split ids into batches of batchSize
    const batches: Batch[] = [];
    for (let i = 0; i < job.ids.length; i += this.batchSize) {
      batches.push({
        batchId: this.generateBatchId(),
        ids: job.ids.slice(i, i + this.batchSize),
        status: "yet_to_start",
      });
    }

    const fullJob: Job = {
      ...job,
      batches,
    };

    this.queue.push(fullJob);
    this.jobStatusMap.set(job.ingestionId, fullJob);
    this.sortQueue();

    if (!this.isProcessing) {
      this.processNextBatch();
    }
  }

  public getJobStatus(ingestionId: string): JobStatusResponse | null {
    const job = this.jobStatusMap.get(ingestionId);
    if (!job) return null;

    // Calculate overall status
    const allStatuses = job.batches.map((b) => b.status);
    let status: JobStatus = "yet_to_start";

    if (allStatuses.every((s) => s === "completed")) {
      status = "completed";
    } else if (
      allStatuses.some((s) => s === "triggered" || s === "completed")
    ) {
      status = "triggered";
    }

    return {
      ingestion_id: job.ingestionId,
      status,
      batches: job.batches.map((b) => ({
        batch_id: b.batchId,
        ids: b.ids,
        status: b.status,
      })),
    };
  }

  private sortQueue(): void {
    this.queue.sort((a, b) => {
      // First sort by priority
      const priorityOrder = {
        HIGH: 0,
        MEDIUM: 1,
        LOW: 2,
      };

      const priorityDiff =
        priorityOrder[a.priority] - priorityOrder[b.priority];

      // If same priority, sort by creation time
      if (priorityDiff === 0) {
        return a.createdAt.getTime() - b.createdAt.getTime();
      }

      return priorityDiff;
    });
  }

  private async processNextBatch(): Promise<void> {
    if (this.queue.length === 0) {
      this.isProcessing = false;
      return;
    }

    this.isProcessing = true;

    // Check rate limit
    const now = Date.now();
    const timeSinceLastProcess = now - this.lastProcessedTime;
    if (timeSinceLastProcess < this.rateLimit) {
      const waitTime = this.rateLimit - timeSinceLastProcess;
      logger.info(
        `Waiting ${waitTime}ms before processing next batch due to rate limit`
      );
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    const batchStartTime = Date.now();
    logger.info(
      `Starting new batch at ${new Date(batchStartTime).toISOString()}`
    );

    // Process next batch
    for (const job of this.queue) {
      const nextUnprocessedBatch = job.batches.find(
        (b) => b.status === "yet_to_start"
      );

      if (nextUnprocessedBatch) {
        logger.info(`Processing batch from job ${job.ingestionId}:`, {
          batchId: nextUnprocessedBatch.batchId,
          priority: job.priority,
          processingIds: nextUnprocessedBatch.ids,
          timeWindow: `T${Math.floor(
            (batchStartTime / this.rateLimit) * 5
          )} to T${Math.floor((batchStartTime / this.rateLimit) * 5) + 5}`,
        });

        // Mark batch as triggered
        nextUnprocessedBatch.status = "triggered";

        // Process each ID in the batch
        for (const id of nextUnprocessedBatch.ids) {
          const startTime = Date.now();
          await this.simulateProcessing(id);
          const processTime = Date.now() - startTime;

          logger.info(`Processed ID ${id}`, {
            jobId: job.ingestionId,
            batchId: nextUnprocessedBatch.batchId,
            priority: job.priority,
            processingTime: `${processTime}ms`,
          });
        }

        // Mark batch as completed
        nextUnprocessedBatch.status = "completed";
        logger.info(`Completed batch ${nextUnprocessedBatch.batchId}`, {
          jobId: job.ingestionId,
          priority: job.priority,
          processedIds: nextUnprocessedBatch.ids,
        });

        // If all batches in the job are completed, remove it from queue
        if (job.batches.every((b) => b.status === "completed")) {
          logger.info(`Completed job ${job.ingestionId}`, {
            priority: job.priority,
            totalBatches: job.batches.length,
          });
          this.queue = this.queue.filter(
            (j) => j.ingestionId !== job.ingestionId
          );
        }

        break; // Only process one batch per iteration
      }
    }

    this.lastProcessedTime = Date.now();

    // Schedule next batch
    setTimeout(() => this.processNextBatch(), this.rateLimit);
  }

  private async simulateProcessing(id: number): Promise<ProcessedData> {
    // Simulate API call with a delay
    await new Promise((resolve) => setTimeout(resolve, 500)); // 500ms delay per ID
    return { id, data: "processed" };
  }
}

export default JobQueue;
