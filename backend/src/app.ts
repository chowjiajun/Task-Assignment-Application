import express from "express";
import helmet from "helmet";
import { config } from "./config/env.js";
import { globalErrorHandler } from "./middlewares/global-error-handling.js";
import { corsMiddleware } from "./middlewares/cors.js";
import { logger } from "./config/logger.js";

// Router imports
import developerRouter from "./modules/developers/router.js";
import skillRouter from "./modules/skills/router.js";
import taskRouter from "./modules/tasks/router.js";

const app = express();

// Enable CORS for all routes (Only enabled in development)
app.use(corsMiddleware);

// Use helmet middleware for security
app.use(helmet());

// Middleware to parse JSON requests
app.use(express.json());

// Import and use routes
app.use("/developers", developerRouter);
app.use("/skills", skillRouter);
app.use("/tasks", taskRouter);

// Global error handling middleware
app.use(globalErrorHandler);

// Start the server
app.listen(config.EXPRESS_PORT, () => {
    logger.info(`Server is running on port ${config.EXPRESS_PORT}`);
});