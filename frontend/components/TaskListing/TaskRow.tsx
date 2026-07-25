import { Table, Text, Group, Badge, Select } from "@mantine/core";
import { notifications } from '@mantine/notifications';
import type { Task } from './types';

export default function TaskRow({ task, statusOptions, assigneeOptions, updateTask, depth }: Readonly<{
    task: Task;
    statusOptions: string[];
    assigneeOptions: { value: string; label: string }[];
    updateTask: (task: Task) => Promise<void>;
    depth: number;
}>) {
    const handleUpdate = async (updatedTask: Task) => {
        try {
            await updateTask(updatedTask);
        } catch (error) {
            notifications.show({
                color: 'red',
                title: 'Failed to update task',
                message: error instanceof Error ? error.message : 'An error occurred',
            });
        }
    };

    return (
        <>
            <Table.Tr key={task.id}>
                <Table.Td>
                    <Text fw={500} style={{ paddingLeft: depth * 24 }}>
                        {depth > 0 && <span style={{ color: 'var(--mantine-color-dimmed)', marginRight: 8 }}>{'↳'}</span>}
                        {task.title}
                    </Text>
                </Table.Td>
                <Table.Td>
                    <Group gap="xs">
                        {task.skills.map((skill) => (
                            <Badge key={skill} variant="light">{skill}</Badge>
                        ))}
                    </Group>
                </Table.Td>
                <Table.Td>
                    <Select
                        data={statusOptions ?? []}
                        value={task.status}
                        onChange={(value) => handleUpdate({ ...task, status: value ?? '' })}
                        w={160}
                    />
                </Table.Td>
                <Table.Td>
                    <Select
                        data={assigneeOptions}
                        value={task.assigneeId ? String(task.assigneeId) : null}
                        placeholder="Unassigned"
                        clearable
                        onChange={(value) => handleUpdate({ ...task, assigneeId: value ? Number(value) : null })}
                        w={180}
                    />
                </Table.Td>
            </Table.Tr>
            {task.subTasks.map((child) => (
                <TaskRow
                    key={child.id}
                    task={child}
                    statusOptions={statusOptions}
                    assigneeOptions={assigneeOptions}
                    updateTask={updateTask}
                    depth={depth + 1}
                />
            ))}
        </>
    );
}