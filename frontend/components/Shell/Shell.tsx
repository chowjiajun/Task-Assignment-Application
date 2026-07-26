import { AppShell, Flex, Title, ActionIcon } from '@mantine/core';
import type { ReactNode } from 'react';
import { useDisclosure } from '@mantine/hooks';
import { PlusIcon } from '@phosphor-icons/react';
import AddTaskModal from './AddTaskModal';

export default function Shell({ children, refetch }: Readonly<{ children: ReactNode; refetch: () => void }>) {
    const [opened, { open, close }] = useDisclosure(false);

    return (
        <AppShell padding="md" header={{ height: 60 }}>
            <AppShell.Header>
                <Flex justify="space-between" align="center" h="100%" px="md">
                    {/* Title */}
                    <Title order={3}>Task Assignment Application</Title>

                    {/* Modal for adding new tasks */}
                    <ActionIcon variant="transparent" aria-label="Add task" onClick={open}>
                        <PlusIcon style={{ width: '70%', height: '70%' }} />
                    </ActionIcon>

                    <AddTaskModal opened={opened} close={close} refetch={refetch} />
                </Flex>
            </AppShell.Header>

            <AppShell.Main>
                {children}
            </AppShell.Main>
        </AppShell>
    );
}