import { db } from "../../infrastructure/database/index.js";
import { tasks, taskSkills } from "../../infrastructure/database/schema.js";
import type { CreateTaskRequest } from "./types.js";

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

export async function getTaskById(id: number) {
    const task = await db.query.tasks.findFirst({
        where: (tasks, { eq }) => eq(tasks.id, id),
    });
    return task;
}