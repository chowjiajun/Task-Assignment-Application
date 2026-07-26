import { TextInput, MultiSelect, Select, Stack, ActionIcon, Group, Paper, Text } from '@mantine/core';
import { PlusIcon } from '@phosphor-icons/react/dist/icons/Plus';
import { XIcon } from '@phosphor-icons/react/dist/icons/X';
import { type TaskInputField, type TaskInputProps } from './types';

export function TaskInput({ form, fieldPath, skills, developers, depth, isMainTask }: Readonly<TaskInputProps>) {
    // Helper: build a form path like "subTasks.0.title" — when fieldPath is empty, just use the field name directly
    const formPathStringBuilder = (name: string) => fieldPath ? `${fieldPath}.${name}` : name;

    // Derive the path to our subTasks array, e.g. "subTasks" or "subTasks.0.subTasks"
    const subTasksPath = formPathStringBuilder('subTasks');

    // Read the current value of our subTasks array from the form (since the form dynamically changes)
    const subTasks: TaskInputField[] = ((): TaskInputField[] => {
        // For first layer we can just return the subTasks array directly
        if (subTasksPath === 'subTasks') return form.values.subTasks;

        // Traverse nested path like "subTasks.0.subTasks" to reach the correct array
        const parts = subTasksPath.split('.');
        let current: unknown = form.values;
        for (const part of parts) {
            current = (current as Record<string, unknown>)?.[part];
        }

        // If have a valid array, return it; otherwise return an empty array to avoid errors
        return (current as TaskInputField[]) ?? [];
    })();

    return (
        <Paper {...(!isMainTask && { p: "sm", withBorder: true, style: { marginLeft: depth * 16, marginBottom: 12 } })}>
            <TextInput
                withAsterisk={isMainTask}
                label="Title"
                placeholder={isMainTask ? "Task title" : "Sub task title"}
                size={isMainTask ? "md" : "sm"}
                key={form.key(formPathStringBuilder('title'))}
                {...form.getInputProps(formPathStringBuilder('title'))}
                mb="sm"
                required={isMainTask}
            />

            <MultiSelect
                label="Skills Required"
                placeholder="Select skills"
                size={isMainTask ? "md" : "sm"}
                data={(skills ?? []).map((s) => ({ value: s.name, label: s.name }))}
                key={form.key(formPathStringBuilder('skillsRequired'))}
                {...form.getInputProps(formPathStringBuilder('skillsRequired'))}
                mb="sm"
            />

            <Select
                label="Assigned To"
                placeholder="Select a developer"
                size={isMainTask ? "md" : "sm"}
                data={(developers ?? []).map((d) => ({ value: String(d.id), label: d.name }))}
                clearable
                key={form.key(formPathStringBuilder('assignedTo'))}
                {...form.getInputProps(formPathStringBuilder('assignedTo'))}
                mb={isMainTask ? "md" : "sm"}
            />

            {/* Nested Tasks: "Add" button + recursive list */}
            <Group justify="space-between" mb="sm">
                <Text fw={400} size={isMainTask ? "sm" : "xs"}>
                    {isMainTask ? "Sub Tasks" : "Nested Sub Tasks"}
                </Text>
                <ActionIcon
                    size={isMainTask ? "md" : "xs"}
                    variant="transparent"
                    onClick={() => form.insertListItem(subTasksPath, {
                        id: crypto.randomUUID(),
                        title: '',
                        skillsRequired: [],
                        assignedTo: null,
                        subTasks: [],
                    })}
                    title="Add sub task"
                >
                    <PlusIcon style={{ width: '70%', height: '70%' }} />
                </ActionIcon>
            </Group>

            {subTasks.length > 0 && (
                <Stack gap="sm" mb={isMainTask ? "md" : "xs"}>
                    {subTasks.map((subTask, index) => (
                        <Group key={subTask.id} justify="space-between" align="flex-start" gap={0}>
                            <div style={{ flex: 1 }}>
                                <TaskInput
                                    form={form}
                                    fieldPath={`${subTasksPath}.${index}`}
                                    skills={skills}
                                    developers={developers}
                                    depth={depth + 1}
                                    isMainTask={false}
                                />
                            </div>
                            <ActionIcon
                                color="red"
                                variant="transparent"
                                onClick={() => form.removeListItem(subTasksPath, index)}
                                title="Remove sub task"
                            >
                                <XIcon style={{ width: '70%', height: '70%' }} />
                            </ActionIcon>
                        </Group>
                    ))}
                </Stack>
            )}
        </Paper>
    );
}
