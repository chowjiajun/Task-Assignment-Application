import winston from "winston";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "./env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logsDir = path.resolve(__dirname, "../../logs");

const logFormat = winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
        const extra = Object.keys(meta).length > 0 ? `\n${JSON.stringify(meta)}` : "";
        const stackTrace = stack ? `\n${stack}` : "";
        return `[${timestamp}][${level}]${message}${extra}${stackTrace}`;
    }),
);

export const logger = winston.createLogger({
    level: config.ENVIRONMENT === "production" ? "info" : "debug",
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                logFormat,
            ),
        }),

        new winston.transports.File({
            filename: path.join(logsDir, "error.log"),
            level: "error",
            format: logFormat,
            maxsize: 5 * 1024 * 1024,
            maxFiles: 5,
        }),

        new winston.transports.File({
            filename: path.join(logsDir, "combined.log"),
            format: logFormat,
            maxsize: 5 * 1024 * 1024,
            maxFiles: 5,
        }),
    ],
});
