import type { CreateTaskInput, Task, UpdateTaskInput } from '#lib/types/index.ts';

import { endpoints } from '../config.ts';
import { http } from '../http.ts';
import type { TasksApi } from './types.ts';

/** REST implementation – talks to the Spring Boot backend. */
export const tasksApi: TasksApi = {
	list: () => http.get<Task[]>(endpoints.tasks.collection),
	get: (id) => http.get<Task>(endpoints.tasks.item(id)),
	create: (input: CreateTaskInput) => http.post<Task>(endpoints.tasks.collection, input),
	update: (id, input: UpdateTaskInput) => http.patch<Task>(endpoints.tasks.item(id), input),
	remove: (id) => http.delete<void>(endpoints.tasks.item(id))
};
