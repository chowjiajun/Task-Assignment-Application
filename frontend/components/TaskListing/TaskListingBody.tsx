import type { Task } from './types';
import { Table } from "@mantine/core";
import TaskRow from './TaskRow';

export default function TaskListingBody({ 
    tasks, 
    statusOptions, 
    assigneeOptions, 
    updateTask,
    depth = 0,
}: Readonly<{ 
    tasks: Task[]; 
    statusOptions: string[]; 
    assigneeOptions: { value: string; label: string }[]; 
    updateTask: (task: Task) => Promise<void>;
    depth?: number;
}>) {
    
    return (
        <Table.Tbody>
            {tasks.map((task) => (
                <TaskRow
                    key={task.id}
                    task={task}
                    statusOptions={statusOptions}
                    assigneeOptions={assigneeOptions}
                    updateTask={updateTask}
                    depth={depth}
                />
            ))}
        </Table.Tbody>
    )
}