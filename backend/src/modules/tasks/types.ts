import type { TaskStatus } from "./constants.js";

export interface CreateTaskRequest {
    title: string;
    status: TaskStatus;
    skillsRequired: string[];
    assignedTo?: number | null;
}