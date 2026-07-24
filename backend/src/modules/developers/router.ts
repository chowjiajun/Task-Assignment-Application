import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { getDeveloperDetails } from './service.js';
import { HTTP_400 } from '../../constants/http-status.js';

const router = express.Router();

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    if (!req.params.id || Number.isNaN(Number(req.params.id))) {
        return res.status(HTTP_400).json({ error: 'Invalid developer ID' });
    }

    try {
        const developer = await getDeveloperDetails(Number(req.params.id));
        res.json(developer);
    } catch (error) {
        next(error);
    }
});

export default router;