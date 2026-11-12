import type { Api } from '../services/types.ts';
import { mockAuthApi, resetMockData } from './auth.ts';
import { mockListsApi } from './lists.ts';
import { mockTasksApi } from './tasks.ts';

export const mockApi: Api = {
	tasks: mockTasksApi,
	lists: mockListsApi,
	auth: mockAuthApi,
	resetMockData
};
