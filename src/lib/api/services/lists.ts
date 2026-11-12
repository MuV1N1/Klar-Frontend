import type { CreateListInput, TaskList, UpdateListInput } from '#lib/types/index.ts';

import { endpoints } from '../config.ts';
import { http } from '../http.ts';
import type { ListsApi } from './types.ts';

/** REST implementation – talks to the Spring Boot backend. */
export const listsApi: ListsApi = {
	list: () => http.get<TaskList[]>(endpoints.lists.collection),
	get: (id) => http.get<TaskList>(endpoints.lists.item(id)),
	create: (input: CreateListInput) => http.post<TaskList>(endpoints.lists.collection, input),
	update: (id, input: UpdateListInput) => http.patch<TaskList>(endpoints.lists.item(id), input),
	remove: (id) => http.delete<void>(endpoints.lists.item(id))
};
