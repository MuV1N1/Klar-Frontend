import { adminApi } from './services/admin.ts';
import { authApi } from './services/auth.ts';
import { eventsApi } from './services/events.ts';
import { listsApi } from './services/lists.ts';
import { notificationsApi } from './services/notifications.ts';
import { tasksApi } from './services/tasks.ts';
import type { Api } from './services/types.ts';

/** The single API entry point used by the stores. */
export const api: Api = {
	tasks: tasksApi,
	lists: listsApi,
	events: eventsApi,
	notifications: notificationsApi,
	auth: authApi,
	admin: adminApi
};

export { ApiError } from './errors.ts';
export type {
	AdminApi,
	Api,
	AuthApi,
	EventsApi,
	ListsApi,
	NotificationsApi,
	OccurrenceRef,
	TasksApi
} from './services/types.ts';
