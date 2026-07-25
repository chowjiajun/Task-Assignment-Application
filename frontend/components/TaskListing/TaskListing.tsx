'use client';

import { Alert, Loader, Stack, Table } from '@mantine/core';
import { useFetch } from '@mantine/hooks';
import { useMemo } from 'react';
import { apiUrl } from '@/lib/api';
import type { Developer, Task as TaskFromApi } from '@/types/api';
import TaskListingBody from './TaskListingBody';
import type { Task } from './types';

export default function TaskListing({ tasksFromApi, tasksLoading, tasksError, refetchTasks }: Readonly<{ 
    tasksFromApi: TaskFromApi[];
    tasksLoading: boolean; 
    tasksError: Error | null; 
    refetchTasks: () => void; }>
) {
    const { data: developers, loading: developersLoading, error: developersError } = useFetch<Developer[]>(apiUrl('/developers/list'));
    const { data: statusOptions, loading: statusesLoading, error: statusesError } = useFetch<string[]>(apiUrl('/tasks/statuses'));

    // Conditions
    const isLoading = tasksLoading || developersLoading || statusesLoading;
    const hasLoadError = Boolean(tasksError || developersError || statusesError);

    const tasks = useMemo(() => {
        return (tasksFromApi ?? []).map((task) => ({
            id: task.id,
            title: task.title,
            skills: task.skillsRequired,
            status: task.status,
            assigneeId: task.assignedTo,
        }));
    }, [tasksFromApi]);

    const assigneeOptions = useMemo(() => {
        return (developers ?? []).map((developer) => ({
            value: String(developer.id),
            label: developer.name,
        }));
    }, [developers]);

    const updateTask = async (task: Task) => {
        const response = await fetch(apiUrl(`/tasks/update/${task.id}`), {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                status: task.status,
                assignedTo: task.assigneeId,
            }),
        });
        

        if (!response.ok) {
            const responseBody = await response.json().catch(() => ({ error: 'Failed to update task' }));
            throw new Error(responseBody.error || 'Failed to update task');
        }

        // Refresh the task list after a successful update
        // To improve, instead of refetching just update local state
        refetchTasks(); 
    };

    if (isLoading) {
        return (
            <Stack align="center" py="xl">
                <Loader />
            </Stack>
        );
    }

    if (hasLoadError) {
        return (
            <Alert color="red" title="Failed to load tasks">
                Could not retrieve tasks. Please try again later.
            </Alert>
        );
    }

    return (
        <Stack>
            <Table striped highlightOnHover withTableBorder>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Title</Table.Th>
                        <Table.Th>Skills</Table.Th>
                        <Table.Th>Status</Table.Th>
                        <Table.Th>Assignee</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <TaskListingBody
                    tasks={tasks}
                    statusOptions={statusOptions ?? []}
                    assigneeOptions={assigneeOptions}
                    updateTask={updateTask}
                />
            </Table>
        </Stack>
    );
}