import { db } from "../../infrastructure/database/index.js";
import { tasks, taskSkills } from "../../infrastructure/database/schema.js";
import { eq, desc } from "drizzle-orm";
import type { CreateTaskRequest, UpdateTaskRequest } from "./types.js";

async function insertSubTasksRecursively(tx: any, parentId: number, subTasks: any[] | null | undefined) {
    if (!subTasks || subTasks.length === 0) return;

    for (const subTask of subTasks) {
        const [createdSubTask] = await tx.insert(tasks).values({
            title: subTask.title,
            status: subTask.status,
            assignedTo: subTask.assignedTo ?? null,
            parentTaskId: parentId,
        }).returning({ id: tasks.id });

        // Insert sub-task skills if any
        if (createdSubTask && subTask.skillsRequired && subTask.skillsRequired.length > 0) {
            await tx.insert(taskSkills).values(
                subTask.skillsRequired.map((skillName: string) => ({
                    taskId: createdSubTask.id,
                    skillName,
                }))
            );
        }

        // Recursively insert nested sub-tasks if any
        if (createdSubTask && subTask.subTasks && subTask.subTasks.length > 0) {
            await insertSubTasksRecursively(tx, createdSubTask.id, subTask.subTasks);
        }
    }
}

export async function createTaskWithSubTasks(taskData: CreateTaskRequest) {
    // Transaction to ensure that the main task and its sub-tasks are created atomically
    await db.transaction(async (tx) => {
        const [parentTask] = await tx.insert(tasks).values({
            title: taskData.title,
            status: taskData.status,
            assignedTo: taskData.assignedTo ?? null,
        }).returning({ id: tasks.id });

        // Insert parent task skills if any
        if (parentTask && taskData.skillsRequired && taskData.skillsRequired.length > 0) {
            await tx.insert(taskSkills).values(
                taskData.skillsRequired.map((skillName) => ({
                    taskId: parentTask.id,
                    skillName,
                }))
            );
        }

        // Insert all nested sub-tasks recursively
        if (parentTask && taskData.subTasks && taskData.subTasks.length > 0) {
            await insertSubTasksRecursively(tx, parentTask.id, taskData.subTasks);
        }
    });
}

export async function getAllTasks() {
    const rows = await db.select({
        id: tasks.id,
        title: tasks.title,
        status: tasks.status,
        assignedTo: tasks.assignedTo,
        parentTaskId: tasks.parentTaskId,
        createdAt: tasks.createdAt,
        updatedAt: tasks.updatedAt,
        skillName: taskSkills.skillName,
    }).from(tasks).leftJoin(taskSkills, eq(taskSkills.taskId, tasks.id)).orderBy(desc(tasks.id));

    // Because of the left join, we may have multiple rows for the same task if it has multiple skills.
    const taskMap = new Map<number, {
        id: number;
        title: string;
        status: string;
        assignedTo: number | null;
        parentTaskId: number | null;
        createdAt: Date;
        updatedAt: Date;
        skillsRequired: string[];
    }>();

    // Iterate through the rows to check for duplicate tasks and aggregate their skills
    for (const row of rows) {
        const existingTask = taskMap.get(row.id);

        if (!existingTask) {
            taskMap.set(row.id, {
                id: row.id,
                title: row.title,
                status: row.status,
                assignedTo: row.assignedTo,
                parentTaskId: row.parentTaskId,
                createdAt: row.createdAt,
                updatedAt: row.updatedAt,
                skillsRequired: row.skillName ? [row.skillName] : [],
            });
            continue;
        }

        if (row.skillName) {
            existingTask.skillsRequired.push(row.skillName);
        }
    }

    return Array.from(taskMap.values());
}

export async function getTaskById(id: number) {
    const task = await db.query.tasks.findFirst({
        where: (tasks, { eq }) => eq(tasks.id, id),
    });
    return task;
}

export async function updateTaskById(id: number, taskData: UpdateTaskRequest) {
    const updatedTask = await db.update(tasks).set({
        status: taskData.status,
        assignedTo: taskData.assignedTo ?? null,
        updatedAt: new Date(),
    }).where(eq(tasks.id, id)).returning({ id: tasks.id });

    if (updatedTask.length === 0) {
        return null;
    }

    return updatedTask[0];
}

export async function getSubTasksByParentId(parentTaskId: number) {
    const subTasks = await db.select({
        id: tasks.id,
        title: tasks.title,
        status: tasks.status,
        assignedTo: tasks.assignedTo,
        parentTaskId: tasks.parentTaskId,
        createdAt: tasks.createdAt,
        updatedAt: tasks.updatedAt,
    }).from(tasks).where(eq(tasks.parentTaskId, parentTaskId))

    return subTasks;
}