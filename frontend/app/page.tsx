'use client'

import Shell from "@/components/Shell/Shell";
import TaskListing from "@/components/TaskListing/TaskListing";
import { apiUrl } from "@/lib/api";
import { useFetch } from "@mantine/hooks";
import type { Task as TaskFromApi } from "@/types/api";

export default function Home() {
	const { data: tasksFromApi, loading: tasksLoading, error: tasksError, refetch: refetchTasks } = useFetch<TaskFromApi[]>(apiUrl('/tasks/list'));

	return (
		<Shell refetch={refetchTasks}>
			<TaskListing tasksFromApi={tasksFromApi ?? []} tasksLoading={tasksLoading} tasksError={tasksError} refetchTasks={refetchTasks} />
		</Shell>
	);
}