import type { Request, Response, NextFunction } from 'express';
import { HTTP_500 } from '../constants/http-status.js';
import { INTERNAL_SERVER_ERROR } from '../constants/error-messages.js';
import { logger } from '../config/logger.js';

export function globalErrorHandler(err: any, req: Request, res: Response, next: NextFunction) {
    logger.error("Global unhandled error", { 
        error: err.message, 
        stack: err.stack,
        method: req.method,
        url: req.originalUrl,
    });
    res.status(HTTP_500).json({ error: INTERNAL_SERVER_ERROR });
}