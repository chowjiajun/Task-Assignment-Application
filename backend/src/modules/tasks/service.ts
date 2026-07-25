import type { CreateTaskRequest, UpdateTaskRequest } from "./types.js";
import {
    createTaskWithSubTasks,
    getAllTasks as getAllTasksInRepository,
    getTaskById as getTaskByIdInRepository,
    updateTaskById as updateTaskByIdInRepository,
} from "./repository.js";
import { getAllSkills } from "../skills/service.js";
import { InvalidSkillsError } from "./errors.js";
import { DrizzleQueryError } from "drizzle-orm/errors";
import { DatabaseError } from "pg";
import { FOREIGN_KEY_VIOLATION } from "../../constants/postgres-error-codes.js";
import { PostgresForeignKeyViolationError } from "../../errors/database.js";
import { TASK_STATUS } from "./constants.js";

async function validateTaskSkills(taskData: CreateTaskRequest) {
    const results = await getAllSkills();
    const availableSkills = new Set(results.map(skill => skill.name));

    // Validate main task's required skills
    for (const skill of taskData.skillsRequired) {
        if (!availableSkills.has(skill)) {
            throw new InvalidSkillsError(`The following skills do not exist: ${skill}`);
        }
    }

    // Validate sub-task skills
    if (taskData.subTasks && taskData.subTasks.length > 0) {
        for (const subTask of taskData.subTasks) {
            for (const skill of subTask.skillsRequired) {
                if (!availableSkills.has(skill)) {
                    throw new InvalidSkillsError(`The following skills do not exist in sub-task: ${skill}`);
                }
            }
        }
    }
}

export async function createTask(taskData: CreateTaskRequest) {
    await validateTaskSkills(taskData);

    try {
        await createTaskWithSubTasks(taskData);
    } catch (error) {
        // Drizzle doesnt throw a specific error for foreign key violations, so we need to check the error code from the underlying database error
        if (error instanceof DrizzleQueryError) {
            if (error.cause instanceof DatabaseError) {
                if (error.cause.code === FOREIGN_KEY_VIOLATION) {
                    throw new PostgresForeignKeyViolationError("Foreign key violation: The assigned developer does not exist.");
                }
            }
        } else {
            throw error;
        }
    }
}

export async function getTaskById(id: number) {
    return await getTaskByIdInRepository(id);
}

export async function getAllTasks() {
    return await getAllTasksInRepository();
}

export async function updateTaskById(id: number, taskData: UpdateTaskRequest) {
    try {
        return await updateTaskByIdInRepository(id, taskData);
    } catch (error) {
        if (error instanceof DrizzleQueryError) {
            if (error.cause instanceof DatabaseError) {
                if (error.cause.code === FOREIGN_KEY_VIOLATION) {
                    throw new PostgresForeignKeyViolationError("Foreign key violation: The assigned developer does not exist.");
                }
            }
        } else {
            throw error;
        }
    }
}

export function getTaskStatuses() {
    return Object.values(TASK_STATUS);
}