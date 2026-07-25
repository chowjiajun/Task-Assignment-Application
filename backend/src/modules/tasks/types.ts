import type { TaskStatus } from "./constants.js";

export interface CreateSubTaskRequest {
    title: string;
    status: TaskStatus;
    skillsRequired: string[];
    assignedTo?: number | null;
}

export interface CreateTaskRequest {
    title: string;
    status: TaskStatus;
    skillsRequired: string[];
    assignedTo?: number | null;
    subTasks?: CreateSubTaskRequest[] | null;
}

export interface UpdateTaskRequest {
    status: TaskStatus;
    assignedTo?: number | null;
}