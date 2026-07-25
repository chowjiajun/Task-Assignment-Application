export type Task = {
    id: number;
    title: string;
    skills: string[];
    status: string;
    assigneeId: number | null;
    subTasks: Task[];
};