import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { HTTP_200, HTTP_400 } from '../../constants/http-status.js';
import type { CreateTaskRequest, UpdateTaskRequest } from './types.js';
import { CREATE_TASK_REQUEST_SCHEMA, UPDATE_TASK_REQUEST_SCHEMA } from './validation.js';
import { validateBody } from '../../middlewares/validate-request.js';
import { createTask, getAllTasks, getTaskById, getTaskStatuses, updateTaskById } from './service.js';
import { InvalidSkillsError, SubTasksNotDoneError } from './errors.js';
import { PostgresForeignKeyViolationError } from '../../errors/database.js';
const router = express.Router();

router.get('/statuses', (_req: Request, res: Response) => {
    return res.status(HTTP_200).json(getTaskStatuses());
});

router.get('/list', async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const tasks = await getAllTasks();
        res.status(HTTP_200).json(tasks);
    } catch (error) {
        next(error);
    }
});

router.post('/create', validateBody<CreateTaskRequest>(CREATE_TASK_REQUEST_SCHEMA), async (req: Request, res: Response, next: NextFunction) => {
    const taskData: CreateTaskRequest = req.body;
    try {
        await createTask(taskData);
    } catch (error) {
        if (error instanceof InvalidSkillsError) {
            return res.status(HTTP_400).json({ error: error.message });
        } else if (error instanceof PostgresForeignKeyViolationError) {
            return res.status(HTTP_400).json({ error: 'Assigned developer does not exist' });
        } else {
            next(error);
        }
    }
    return res.status(HTTP_200).json({ message: 'Task created successfully' });
});

router.get('/:id', async (req: Request, res: Response) => {
    if (!req.params.id || Number.isNaN(Number(req.params.id))) {
        return res.status(HTTP_400).json({ error: 'Invalid task ID' });
    }

    const taskId = Number(req.params.id);
    const task = await getTaskById(taskId);
    if (!task) {
        return res.status(HTTP_400).json({ error: 'Task not found' });
    }
    res.status(HTTP_200).json(task);
});

router.patch('/update/:id', validateBody<UpdateTaskRequest>(UPDATE_TASK_REQUEST_SCHEMA), async (req: Request, res: Response, next: NextFunction) => {
    if (!req.params.id || Number.isNaN(Number(req.params.id))) {
        return res.status(HTTP_400).json({ error: 'Invalid task ID' });
    }

    const taskId = Number(req.params.id);
    const taskData: UpdateTaskRequest = req.body;

    try {
        const updatedTask = await updateTaskById(taskId, taskData);

        if (!updatedTask) {
            return res.status(HTTP_400).json({ error: 'Task not found' });
        }

        return res.status(HTTP_200).json({ message: 'Task updated successfully' });
    } catch (error) {
        if (error instanceof PostgresForeignKeyViolationError) {
            return res.status(HTTP_400).json({ error: 'Assigned developer does not exist' });
        } else if (error instanceof SubTasksNotDoneError) {
            return res.status(HTTP_400).json({ error: error.message });
        } else {
            next(error);
        }
    }
});

export default router;