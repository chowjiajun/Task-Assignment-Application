import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { getAllDevelopers, getDeveloperById } from './service.js';
import { HTTP_400 } from '../../constants/http-status.js';

const router = express.Router();

router.get('/list', async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const developers = await getAllDevelopers();
        res.json(developers);
    } catch (error) {
        next(error);
    }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    if (!req.params.id || Number.isNaN(Number(req.params.id))) {
        return res.status(HTTP_400).json({ error: 'Invalid developer ID' });
    }

    try {
        const developer = await getDeveloperById(Number(req.params.id));
        if (!developer) {
            return res.status(HTTP_400).json({ error: 'Developer not found' });
        }

        res.json(developer);
    } catch (error) {
        next(error);
    }
});

export default router;