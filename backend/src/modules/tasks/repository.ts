import { db } from "../../infrastructure/database/index.js";
import { tasks } from "../../infrastructure/database/schema.js";
import type { CreateTaskRequest } from "./types.js";

export async function createTask(taskData: CreateTaskRequest) {
    await db.insert(tasks).values({
        title: taskData.title,
        status: taskData.status,
        assignedTo: taskData.assignedTo ?? null,
    });
}

export async function getTaskById(id: number) {
    const task = await db.query.tasks.findFirst({
        where: (tasks, { eq }) => eq(tasks.id, id),
    });
    return task;
}