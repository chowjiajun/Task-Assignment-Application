import { db } from "../../infrastructure/database/index.js";
import { tasks, taskSkills } from "../../infrastructure/database/schema.js";
import { eq } from "drizzle-orm";
import type { CreateTaskRequest, UpdateTaskRequest } from "./types.js";

export async function createTask(taskData: CreateTaskRequest) {
    const [createdTask] = await db.insert(tasks).values({
        title: taskData.title,
        status: taskData.status,
        assignedTo: taskData.assignedTo ?? null,
    }).returning({ id: tasks.id });

    // Insert task skills if any
    if (createdTask && taskData.skillsRequired && taskData.skillsRequired.length > 0) {
        await db.insert(taskSkills).values(
            taskData.skillsRequired.map((skillName) => ({
                taskId: createdTask.id,
                skillName,
            }))
        );
    }
}

export async function getAllTasks() {
    const rows = await db.select({
        id: tasks.id,
        title: tasks.title,
        status: tasks.status,
        assignedTo: tasks.assignedTo,
        createdAt: tasks.createdAt,
        updatedAt: tasks.updatedAt,
        skillName: taskSkills.skillName,
    }).from(tasks).leftJoin(taskSkills, eq(taskSkills.taskId, tasks.id));

    // Because of the left join, we may have multiple rows for the same task if it has multiple skills.
    const taskMap = new Map<number, {
        id: number;
        title: string;
        status: string;
        assignedTo: number | null;
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