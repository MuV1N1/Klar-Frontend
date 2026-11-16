import type { NotificationSettings } from '#lib/types/index.ts';

import type { NotificationsApi } from '../services/types.ts';
import { MOCK_KEYS, delay, readStorage, writeStorage } from './storage.ts';

/** Same defaults as the backend (V6): 15 minutes before / on the day at 9:00, via push. */
export function readNotificationSettings(): NotificationSettings {
	return readStorage<NotificationSettings>(MOCK_KEYS.notifications, () => ({
		timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
		eventReminders: [{ minutesBefore: 15, channel: 'push' }],
		allDayEventReminders: [{ minutesBefore: -540, channel: 'push' }]
	}));
}

/** Mock: settings in localStorage, Web Push is not available. */
export const mockNotificationsApi: NotificationsApi = {
	async settings() {
		await delay();
		return readNotificationSettings();
	},
	async updateSettings(input) {
		await delay();
		const updated = { ...readNotificationSettings(), ...input };
		writeStorage(MOCK_KEYS.notifications, updated);
		return updated;
	},
	async pushConfig() {
		return { enabled: false, publicKey: null };
	},
	async subscribe() {},
	async unsubscribe() {},
	async testPush() {
		return 0;
	}
};
