import { useForm } from '@mantine/form';
import type { Developer, Skill } from '@/types/api';

export interface TaskInputField {
    id: string;
    title: string;
    skillsRequired: string[];
    assignedTo: string | null;
    subTasks?: TaskInputField[];
}

export interface FormValues {
    title: string;
    skillsRequired: string[];
    assignedTo: string | null;
    subTasks: TaskInputField[];
}

export interface TaskInputProps {
    form: ReturnType<typeof useForm<FormValues>>;
    fieldPath: string;
    skills: Skill[] | undefined;
    developers: Developer[] | undefined;
    depth: number;
    isMainTask: boolean;
}
