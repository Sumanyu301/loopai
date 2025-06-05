import { z } from "zod";

// Define the Priority enum
export const Priority = {
  HIGH: "HIGH",
  MEDIUM: "MEDIUM",
  LOW: "LOW",
} as const;

// Define the ingest data schema
export const ingestSchema = z.object({
  ids: z
    .array(
      z
        .number()
        .int()
        .min(1)
        .max(Math.pow(10, 9) + 7)
        .describe("ID must be between 1 and 10^9+7")
    )
    .min(1, "At least one ID is required")
    .describe("Array of integer IDs"),

  priority: z
    .enum([Priority.HIGH, Priority.MEDIUM, Priority.LOW])
    .describe("Priority level of the data"),
});

// Type for the ingest data
export type IngestData = z.infer<typeof ingestSchema>;
