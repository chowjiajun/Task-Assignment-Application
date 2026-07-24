export const TASK_STATUS = {
    TODO: "To-do",
    IN_PROGRESS: "In progress",
    DONE: "Done",
} as const;

export type TaskStatus = typeof TASK_STATUS[keyof typeof TASK_STATUS];