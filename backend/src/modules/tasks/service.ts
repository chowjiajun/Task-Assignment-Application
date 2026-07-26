import type { CreateTaskRequest, Task, UpdateTaskRequest } from "./types.js";
import {
    createTaskWithSubTasks,
    getAllTasks as getAllTasksInRepository,
    getSubTasksByParentId,
    getTaskById as getTaskByIdInRepository,
    getTaskSkillsByTaskId,
    updateTaskById as updateTaskByIdInRepository,
} from "./repository.js";
import { getAllSkills } from "../skills/service.js";
import { getDeveloperSkills } from "../developers/service.js";
import { InvalidSkillsError, SubTasksNotDoneError, DeveloperMissingSkillsError } from "./errors.js";
import { DrizzleQueryError } from "drizzle-orm/errors";
import { DatabaseError } from "pg";
import { FOREIGN_KEY_VIOLATION } from "../../constants/postgres-error-codes.js";
import { PostgresForeignKeyViolationError } from "../../errors/database.js";
import { TASK_STATUS, type TaskStatus } from "./constants.js";
import { skillClassificationAgent } from "../../agents/skill-classification-agent/agent.js";
import { logger } from "../../config/logger.js";


export async function createTask(taskData: CreateTaskRequest) {
    // Check if the provided skills exist in the database
    const allSkills = await getAllSkills();
    const availableSkills = new Set(allSkills.map(skill => skill.name));
    validateTaskSkills(taskData, availableSkills);

    // Classify the task and its sub-tasks to determine required skills if not provided
    await classifyTaskSkills(taskData);

    // After classification, check if the assigned developer has the required skills.
    // If not, clear the assignment and let the caller know so the user can reassign later.
    let assignmentRemoved = false;
    if (taskData.assignedTo) {
        const hasSkills = await checkDeveloperSkills(taskData.assignedTo, taskData.skillsRequired);
        if (!hasSkills) {
            taskData.assignedTo = null;
            assignmentRemoved = true;
            logger.warn("Cleared task assignment — developer lacks required skills after classification", {
                taskTitle: taskData.title,
            });
        }
    }

    // Also check nested sub-tasks
    if (taskData.subTasks) {
        for (const subTask of taskData.subTasks) {
            const subResult = await clearInvalidAssignmentsRecursive(subTask);
            if (subResult) assignmentRemoved = true;
        }
    }

    try {
        await createTaskWithSubTasks(taskData);
        return { assignmentRemoved };
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

async function checkDeveloperSkills(developerId: number, requiredSkills: string[]): Promise<boolean> {
    if (requiredSkills.length === 0) return true;

    // Retrieve the skills of the developer from the database
    const developerSkillNames = await getDeveloperSkills(developerId);
    const developerSkillSet = new Set(developerSkillNames);

    // Check if the developer has all the required skills
    return requiredSkills.every(skill => developerSkillSet.has(skill));
}

async function clearInvalidAssignmentsRecursive(taskData: CreateTaskRequest): Promise<boolean> {
    let cleared = false;

    if (taskData.assignedTo) {
        const hasSkills = await checkDeveloperSkills(taskData.assignedTo, taskData.skillsRequired);
        if (!hasSkills) {
            taskData.assignedTo = null;
            cleared = true;
        }
    }

    if (taskData.subTasks) {
        for (const subTask of taskData.subTasks) {
            const subResult = await clearInvalidAssignmentsRecursive(subTask);
            if (subResult) cleared = true;
        }
    }

    return cleared;
}

function validateTaskSkills(taskData: CreateTaskRequest, availableSkills: Set<string>): void {
    for (const skill of taskData.skillsRequired) {
        if (!availableSkills.has(skill)) {
            throw new InvalidSkillsError(`The following skills do not exist: ${skill}`);
        }
    }

    if (taskData.subTasks) {
        for (const subTask of taskData.subTasks) {
            validateTaskSkills(subTask, availableSkills);
        }
    }
}

async function classifyTaskSkills(taskData: CreateTaskRequest) {
    const results = await getAllSkills();
    const availableSkills = results.map(skill => skill.name);

    if (taskData.skillsRequired.length === 0) {
        const classificationResult = await skillClassificationAgent.run(taskData.title, availableSkills);
        taskData.skillsRequired = classificationResult.skills;
    }

    if (taskData.subTasks && taskData.subTasks.length > 0) {
        for (const subTask of taskData.subTasks) {
            await classifyTaskSkills(subTask);
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

    // If the assignee is being changed, validate they have the required skills
    if (taskData.assignedTo !== undefined && taskData.assignedTo !== null) {
        const task = await getTaskByIdInRepository(id);
        if (task) {
            const taskSkills = await getTaskSkillsByTaskId(id);
            const hasSkills = await checkDeveloperSkills(taskData.assignedTo, taskSkills.map(s => s.skillName).filter((s): s is string => s !== null));
            if (!hasSkills) {
                throw new DeveloperMissingSkillsError("The assigned developer does not have all the required skills for this task.");
            }
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