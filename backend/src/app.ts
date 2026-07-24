import express from "express";
import helmet from "helmet";
import { config } from "./config/env.js";

const app = express();

// Use helmet middleware for security
app.use(helmet());

// Start the server
app.listen(config.EXPRESS_PORT, () => {
    console.log(`Server is running on port ${config.EXPRESS_PORT}`);
});