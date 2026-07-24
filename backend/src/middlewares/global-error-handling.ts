import type { Request, Response, NextFunction } from 'express';
import { HTTP_500 } from '../constants/http-status.js';
import { INTERNAL_SERVER_ERROR } from '../constants/error-messages.js';

export function globalErrorHandler(err: any, req: Request, res: Response, next: NextFunction) {
    console.error(err.stack);
    res.status(HTTP_500).json({ error: INTERNAL_SERVER_ERROR });
}