import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import { config } from "./config";
import { errorHandler } from "./middleware";
import ingestRoutes from "./routes/ingest.routes";
import statusRoutes from "./routes/status.routes";
import logger from "./utils/logger";

const app = express();

// Security middleware
app.use(helmet());
app.use(cors(config.corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMax,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
});
app.use(limiter);

// Request parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use(
  morgan("combined", {
    stream: { write: (message) => logger.info(message.trim()) },
  })
);

// Routes
app.use("/api/v1/ingest", ingestRoutes);
app.use("/api/v1/status", statusRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy" });
});

// Error handling
app.use(errorHandler);

// Start server
const port = config.port;
app.listen(port, () => {
  logger.info(`Server is running on port ${port} in ${config.nodeEnv} mode`);
});
