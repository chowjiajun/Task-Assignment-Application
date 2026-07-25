import type { CreateTaskRequest, Task, UpdateTaskRequest } from "./types.js";
import {
    createTaskWithSubTasks,
    getAllTasks as getAllTasksInRepository,
    getSubTasksByParentId,
    getTaskById as getTaskByIdInRepository,
    updateTaskById as updateTaskByIdInRepository,
} from "./repository.js";
import { getAllSkills } from "../skills/service.js";
import { InvalidSkillsError, SubTasksNotDoneError } from "./errors.js";
import { DrizzleQueryError } from "drizzle-orm/errors";
import { DatabaseError } from "pg";
import { FOREIGN_KEY_VIOLATION } from "../../constants/postgres-error-codes.js";
import { PostgresForeignKeyViolationError } from "../../errors/database.js";
import { TASK_STATUS, type TaskStatus } from "./constants.js";

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

async function validateTaskSkills(taskData: CreateTaskRequest) {
    // Seperating the first level of skills because we have to retrieve all skills from the database 
    const results = await getAllSkills();
    const availableSkills = new Set(results.map(skill => skill.name));

    // Validate main task's required skills
    for (const skill of taskData.skillsRequired) {
        if (!availableSkills.has(skill)) {
            throw new InvalidSkillsError(`The following skills do not exist: ${skill}`);
        }
    }

    // Validate all nested sub-task skills recursively
    if (taskData.subTasks && taskData.subTasks.length > 0) {
        for (let i = 0; i < taskData.subTasks.length; i++) {
            validateSubTaskSkillsRecursive(taskData.subTasks[i]!, availableSkills, `sub-task ${i + 1}`);
        }
    }
}

function validateSubTaskSkillsRecursive(subTask: CreateTaskRequest, availableSkills: Set<string>, path: string = "sub-task"): void {
    for (const skill of subTask.skillsRequired) {
        if (!availableSkills.has(skill)) {
            throw new InvalidSkillsError(`The following skills do not exist in ${path}: ${skill}`);
        }
    }

    if (subTask.subTasks && subTask.subTasks.length > 0) {
        for (let i = 0; i < subTask.subTasks.length; i++) {
            validateSubTaskSkillsRecursive(subTask.subTasks[i]!, availableSkills, `${path} (nested level ${i + 1})`);
        }
    }
}

export async function getTaskById(id: number) {
    return await getTaskByIdInRepository(id);
}

export async function getAllTasks() {
    // Retrieve all tasks from the repository, including their skills
    const results = await getAllTasksInRepository();

    // Create a map for each task by its ID
    const taskMap = new Map<number, Task>();

    // Populate the taskMap with tasks and their skills
    for (const task of results) {
        const tempTask: Task = {
            id: task.id,
            title: task.title,
            status: task.status as TaskStatus,
            assignedTo: task.assignedTo,
            parentTaskId: task.parentTaskId,
            skillsRequired: task.skillsRequired,
            subTasks: [],
        };
        taskMap.set(task.id, tempTask);
    }
    
    // For each task inside map, find the parent and add the task to the parent's children array
    for (const task of taskMap.values()) {
        if (task.parentTaskId && taskMap.has(task.parentTaskId)) {
            const parentTask = taskMap.get(task.parentTaskId);
            if (parentTask) {
                parentTask.subTasks.push(task);
            }
        }
    }
    
    // Return only root tasks (tasks without a parent)
    return Array.from(taskMap.values()).filter(task => !task.parentTaskId);
}

export async function updateTaskById(id: number, taskData: UpdateTaskRequest) {
    // Check if this is a parent task, we need to check if the status of all sub-tasks are completed before allowing the parent task to be marked as completed
    if (taskData.status === TASK_STATUS.DONE) {
        const subTasks = await getSubTasksByParentId(id);
        const incompleteSubTasks = subTasks.filter(subTask => subTask.status !== TASK_STATUS.DONE);

        if (incompleteSubTasks.length > 0) {
            throw new SubTasksNotDoneError("Cannot mark parent task as done while it has incomplete sub-tasks.");
        }
    }

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