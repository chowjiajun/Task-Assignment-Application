import express from "express";
import helmet from "helmet";
import { config } from "./config/env.js";
import { globalErrorHandler } from "./middlewares/global-error-handling.js";

// Router imports
import developerRouter from "./modules/developers/router.js";
import skillRouter from "./modules/skills/router.js";

const app = express();

// Use helmet middleware for security
app.use(helmet());

// Import and use routes
app.use("/developers", developerRouter);
app.use("/skills", skillRouter);

// Global error handling middleware
app.use(globalErrorHandler);

// Start the server
app.listen(config.EXPRESS_PORT, () => {
    console.log(`Server is running on port ${config.EXPRESS_PORT}`);
});