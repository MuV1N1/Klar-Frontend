import type { NotificationSettings, PushConfig } from '#lib/types/index.ts';

import { endpoints } from '../config.ts';
import { http } from '../http.ts';
import type { NotificationsApi } from './types.ts';

function pick(settings: NotificationSettings): NotificationSettings {
	return {
		timeZone: settings.timeZone,
		eventReminders: settings.eventReminders,
		allDayEventReminders: settings.allDayEventReminders
	};
}

/** REST implementation – talks to the Spring Boot backend. */
export const notificationsApi: NotificationsApi = {
	settings: async () => pick(await http.get<NotificationSettings>(endpoints.settings)),
	updateSettings: async (input) =>
		pick(await http.patch<NotificationSettings>(endpoints.settings, input)),
	pushConfig: () => http.get<PushConfig>(endpoints.push.config),
	subscribe: (subscription) => http.post<void>(endpoints.push.subscriptions, subscription),
	unsubscribe: (endpoint) => http.delete<void>(endpoints.push.subscriptions, { endpoint }),
	testPush: async () => (await http.post<{ delivered: number }>(endpoints.push.test)).delivered
};
