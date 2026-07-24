import type { TaskStatus } from "./constants.js";

export interface CreateTaskRequest {
    title: string;
    status: TaskStatus;
    assignedTo?: number | null;
}