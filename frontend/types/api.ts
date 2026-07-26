export interface Developer {
    id: number;
    name: string;
}

export interface Skill {
    name: string;
}

export interface Task {
    id: number;
    title: string;
    status: string;
    assignedTo: number | null;
    parentTaskId: number | null;
    skillsRequired: string[];
    subTasks: Task[];
}

export interface CreateTaskResponse {
    message: string;
    assignmentRemoved?: boolean;
}