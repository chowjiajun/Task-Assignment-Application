import { config } from '../config/env.js'
import type { Request, Response, NextFunction } from 'express';

/**
 * CORS middleware for handling cross-origin requests in development environment
 * @param req The Express request object
 * @param res The Express response object
 * @param next The next middleware function
 * @returns void
 */
export function corsMiddleware(req: Request, res: Response, next: NextFunction) {
    // Only allow CORS in development environment
    if (config.ENVIRONMENT === 'development') {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        // Respond to preflight requests without passing to route handlers
        if (req.method === 'OPTIONS') {
            return res.sendStatus(204);
        }
    }

    next();
}