import { Table, Text, Group, Badge, Select } from "@mantine/core";
import type { Task } from './types';
export default function TaskListingBody({ 
    tasks, 
    statusOptions, 
    assigneeOptions, 
    updateTask
}: Readonly<{ 
    tasks: Task[]; 
    statusOptions: string[]; 
    assigneeOptions: { value: string; label: string }[]; 
    updateTask: (task: Task) => Promise<void>;
}>) {
    
    return (
        <Table.Tbody>
            {tasks.map((task) => (
                <Table.Tr key={task.id}>
                    <Table.Td>
                        <Text fw={500}>{task.title}</Text>
                    </Table.Td>
                    <Table.Td>
                        <Group gap="xs">
                            {task.skills.map((skill) => (
                                <Badge key={skill} variant="light">
                                    {skill}
                                </Badge>
                            ))}
                        </Group>
                    </Table.Td>
                    <Table.Td>
                        <Select
                            data={statusOptions ?? []}
                            value={task.status}
                            onChange={(value) => updateTask({ ...task, status: value ?? '' })}
                            w={160}
                        />
                    </Table.Td>
                    <Table.Td>
                        <Select
                            data={assigneeOptions}
                            value={task.assigneeId ? String(task.assigneeId) : null}
                            placeholder="Unassigned"
                            clearable
                            onChange={(value) => updateTask({ ...task, assigneeId: value ? Number(value) : null })}
                            w={180}
                        />
                    </Table.Td>
                </Table.Tr>
            ))}
        </Table.Tbody>
    )
}