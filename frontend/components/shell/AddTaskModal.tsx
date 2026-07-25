import { useState } from 'react';
import { Alert, Button, Group, Loader, Modal, MultiSelect, Select, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useFetch } from '@mantine/hooks';
import { apiUrl } from '@/lib/api';
import type { Developer, Skill } from '@/types/api';

export default function AddTaskModal({ opened, close, refetch }: Readonly<{ opened: boolean; close: () => void; refetch: () => void }>) {
    const { data: developers, loading: developersLoading, error: developersError } = useFetch<Developer[]>(apiUrl('/developers/list'));
    const { data: skills, loading: skillsLoading, error: skillsError } = useFetch<Skill[]>(apiUrl('/skills/list'));
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const isLoading = developersLoading || skillsLoading;
    const hasError = developersError || skillsError;

    const form = useForm({
        initialValues: {
            title: '',
            skillsRequired: [] as string[],
            assignedTo: null,
        },
    });

    const handleSubmit = async (values: typeof form.values) => {
        setSubmitting(true);
        setSubmitError(null);

        try {
            const response = await fetch(apiUrl('/tasks/create'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: values.title,
                    status: 'To-do',
                    skillsRequired: values.skillsRequired,
                    assignedTo: values.assignedTo ? Number(values.assignedTo) : null,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create task');
            }

            form.reset();
            close();
            refetch();
        } catch (error) {
            setSubmitError(error instanceof Error ? error.message : 'An error occurred');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal opened={opened} onClose={close} title="Add New Task">
            {isLoading ? (
                <Stack align="center" py="xl">
                    <Loader />
                </Stack>
            ) : (
                <form onSubmit={form.onSubmit(handleSubmit)}>

                    {hasError && (
                        <Alert color="red" title="Failed to load form data">
                            Could not fetch required data. Please try again later.
                        </Alert>
                    )}

                    {submitError && (
                        <Alert color="red" title="Failed to create task" mb="md">
                            {submitError}
                        </Alert>
                    )}

                    <TextInput
                        withAsterisk
                        label="Title"
                        placeholder="Task title"
                        key={form.key('title')}
                        {...form.getInputProps('title')}
                        required
                    />

                    <MultiSelect
                        mt="md"
                        label="Skills Required"
                        placeholder="Select skills"
                        data={(skills ?? []).map((s) => ({ value: s.name, label: s.name }))}
                        key={form.key('skillsRequired')}
                        {...form.getInputProps('skillsRequired')}
                    />

                    <Select
                        mt="md"
                        label="Assigned To"
                        placeholder="Select a developer"
                        data={(developers ?? []).map((d) => ({ value: String(d.id), label: d.name }))}
                        clearable
                        key={form.key('assignedTo')}
                        {...form.getInputProps('assignedTo')}
                    />

                    <Group justify="flex-end" mt="md">
                        <Button type="submit" loading={submitting} disabled={submitting}>
                            Submit
                        </Button>
                    </Group>
                </form>
            )}
        </Modal>
    );
}