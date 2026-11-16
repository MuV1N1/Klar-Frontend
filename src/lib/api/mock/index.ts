import type { Api } from '../services/types.ts';
import { mockAuthApi, resetMockData } from './auth.ts';
import { mockEventsApi } from './events.ts';
import { mockListsApi } from './lists.ts';
import { mockNotificationsApi } from './notifications.ts';
import { mockTasksApi } from './tasks.ts';

export const mockApi: Api = {
	tasks: mockTasksApi,
	lists: mockListsApi,
	events: mockEventsApi,
	notifications: mockNotificationsApi,
	auth: mockAuthApi,
	resetMockData
};
