'use client';
import { useEffect, useState } from 'react';
import { Button, Group, Loader, Modal, Stack, Divider } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useFetch } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { apiUrl, extractApiError } from '@/utils/api';
import type { Developer, Skill } from '@/types/api';
import { TaskInput } from './TaskInput';
import { type TaskInputField, type FormValues } from './types';

export default function AddTaskModal({ opened, close, refetch }: Readonly<{ opened: boolean; close: () => void; refetch: () => void }>) {
    const { data: developers, loading: developersLoading, error: developersError } = useFetch<Developer[]>(apiUrl('/developers/list'));
    const { data: skills, loading: skillsLoading, error: skillsError } = useFetch<Skill[]>(apiUrl('/skills/list'));

    const [submitting, setSubmitting] = useState(false);

    const form = useForm<FormValues>({
        initialValues: { title: '', skillsRequired: [], assignedTo: null, subTasks: [] },
    });

    // Show notification when fetch fails
    const hasFetchError = developersError || skillsError;
    useEffect(() => {
        if (hasFetchError) {
            notifications.show({
                color: 'red',
                title: 'Failed to load data',
                message: 'Could not fetch required data. Please try again later.',
            });
        }
    }, [hasFetchError]);

    // Recursively strip frontend-only fields (id, subTasks nesting) for the API
    const toAPIBody = (subTasks: TaskInputField[]): Record<string, unknown>[] =>
        subTasks.map(({ title, skillsRequired, assignedTo, subTasks: nested }) => ({
            title,
            status: 'To-do',
            skillsRequired,
            assignedTo: assignedTo ? Number(assignedTo) : null,
            ...(nested?.length && { subTasks: toAPIBody(nested) }),
        }));

    const handleSubmit = async (values: FormValues) => {
        setSubmitting(true);

        try {
            const response = await fetch(apiUrl('/tasks/create'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: values.title,
                    status: 'To-do',
                    skillsRequired: values.skillsRequired,
                    assignedTo: values.assignedTo ? Number(values.assignedTo) : null,
                    subTasks: values.subTasks.length ? toAPIBody(values.subTasks) : undefined,
                }),
            });

            if (!response.ok) throw new Error(await extractApiError(response));

            form.reset();
            close();
            refetch();
        } catch (error) {
            notifications.show({
                color: 'red',
                title: 'Failed to create task',
                message: error instanceof Error ? error.message : 'An error occurred',
            });
        } finally {
            setSubmitting(false);
        }
    };

    const isLoading = developersLoading || skillsLoading;

    return (
        <Modal opened={opened} onClose={close} title="Add New Task" size="xl">
            {isLoading ? (
                <Stack align="center" py="xl"><Loader /></Stack>
            ) : (
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <TaskInput
                        form={form}
                        fieldPath=""
                        skills={skills ?? undefined}
                        developers={developers ?? undefined}
                        depth={0}
                        isMainTask={true}
                    />

                    <Divider my="md" />
                    <Group justify="flex-end" mt="md">
                        <Button type="submit" loading={submitting} disabled={submitting}>Submit</Button>
                    </Group>
                </form>
            )}
        </Modal>
    );
}