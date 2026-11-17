import { adminApi } from './services/admin.ts';
import { authApi } from './services/auth.ts';
import { eventsApi } from './services/events.ts';
import { groupsApi } from './services/groups.ts';
import { listsApi } from './services/lists.ts';
import { notificationsApi } from './services/notifications.ts';
import { tasksApi } from './services/tasks.ts';
import type { Api } from './services/types.ts';

/** The single API entry point used by the stores. */
export const api: Api = {
	tasks: tasksApi,
	lists: listsApi,
	events: eventsApi,
	groups: groupsApi,
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
	GroupsApi,
	ListsApi,
	NotificationsApi,
	OccurrenceRef,
	TasksApi
} from './services/types.ts';
