import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { getSkillByName } from './service.js';
import { HTTP_400, HTTP_404 } from '../../constants/http-status.js';

const router = express.Router();

router.get('/:skill', async (req: Request, res: Response, next: NextFunction) => {
    const skill = req.params.skill;
    if (typeof skill !== 'string' || skill.trim() === '') {
        return res.status(HTTP_400).json({ error: 'Skill name is invalid or empty' });
    }

    try {
        const skillDetails = await getSkillByName(skill);
        if (!skillDetails) {
            return res.status(HTTP_404).json({ error: 'Skill not found' });
        }
        res.json(skillDetails);
    } catch (error) {
        next(error);
    }
});

export default router;