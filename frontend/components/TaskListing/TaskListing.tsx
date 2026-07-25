'use client';

import { useEffect, useMemo } from 'react';
import { Loader, Stack, Table } from '@mantine/core';
import { useFetch } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { apiUrl, extractApiError } from '@/utils/api';
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

    const isLoading = tasksLoading || developersLoading || statusesLoading;
    const hasLoadError = Boolean(tasksError || developersError || statusesError);

    useEffect(() => {
        if (hasLoadError) {
            notifications.show({
                color: 'red',
                title: 'Failed to load tasks',
                message: 'Could not retrieve tasks. Please try again later.',
            });
        }
    }, [hasLoadError]);

    const tasks = useMemo(() => (tasksFromApi ?? []).map(toLocalTask), [tasksFromApi]);

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

        if (!response.ok) throw new Error(await extractApiError(response));

        refetchTasks(); 
    };

    if (isLoading) {
        return (
            <Stack align="center" py="xl">
                <Loader />
            </Stack>
        );
    }

    return (
        <Stack>
            <Table striped highlightOnHover withTableBorder style={{ tableLayout: 'fixed' }}>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th w="50%">Title</Table.Th>
                        <Table.Th w="20%">Skills</Table.Th>
                        <Table.Th w="15%">Status</Table.Th>
                        <Table.Th w="15%">Assignee</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <TaskListingBody
                    tasks={tasks}
                    statusOptions={statusOptions ?? []}
                    assigneeOptions={assigneeOptions}
                    updateTask={updateTask}
                    depth={0}
                />
            </Table>
        </Stack>
    );
}

function toLocalTask(apiTask: TaskFromApi): Task {
    return {
        id: apiTask.id,
        title: apiTask.title,
        skills: apiTask.skillsRequired,
        status: apiTask.status,
        assigneeId: apiTask.assignedTo,
        subTasks: (apiTask.subTasks ?? []).map(toLocalTask),
    };
}