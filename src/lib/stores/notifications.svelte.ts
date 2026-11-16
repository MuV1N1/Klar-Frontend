import { browser } from '$app/env';

import { api } from '#lib/api/index.ts';
import { toApiError } from '#lib/api/errors.ts';
import type { NotificationSettings, PushConfig, Reminder } from '#lib/types/index.ts';

/**
 * - `unsupported`: the browser has no Web Push (on iPhone: only after "Add to Home Screen")
 * - `unavailable`: the server has no VAPID keys
 * - `denied`: notifications are blocked in the browser settings
 * - `off` / `on`: this device is (not) subscribed
 */
export type PushState = 'unsupported' | 'unavailable' | 'denied' | 'off' | 'on';

function browserTimeZone(): string {
	return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

function supportsPush(): boolean {
	return (
		browser && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
	);
}

/** VAPID key (base64url) as the byte array `PushManager.subscribe()` expects. */
function keyBytes(base64url: string): Uint8Array<ArrayBuffer> {
	const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
	const raw = atob(base64 + '='.repeat((4 - (base64.length % 4)) % 4));
	return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

/** Reminder defaults, the user's time zone and Web Push on this device. */
class NotificationsStore {
	#settings = $state<NotificationSettings | null>(null);
	#config = $state<PushConfig | null>(null);
	#push = $state<PushState>('unsupported');
	#initialised = false;

	get settings(): NotificationSettings | null {
		return this.#settings;
	}

	get push(): PushState {
		return this.#push;
	}

	defaultsFor(allDay: boolean): Reminder[] {
		const settings = this.#settings;
		if (!settings) return [];
		return allDay ? settings.allDayEventReminders : settings.eventReminders;
	}

	/**
	 * Once after login: loads the settings, keeps the backend's time zone in sync with the browser
	 * and re-registers an existing push subscription (it may belong to a previous account).
	 */
	async initialise() {
		if (this.#initialised || !browser) return;
		this.#initialised = true;
		try {
			const [settings, config] = await Promise.all([
				api.notifications.settings(),
				api.notifications.pushConfig()
			]);
			this.#config = config;
			this.#settings = settings;
			const zone = browserTimeZone();
			if (zone && settings.timeZone !== zone) {
				this.#settings = await api.notifications.updateSettings({ timeZone: zone });
			}
			await this.refreshPushState(true);
		} catch {
			// Not critical: the calendar works without it. Allow a retry on the next call.
			this.#initialised = false;
		}
	}

	async updateDefaults(allDay: boolean, reminders: Reminder[]) {
		try {
			this.#settings = await api.notifications.updateSettings(
				allDay ? { allDayEventReminders: reminders } : { eventReminders: reminders }
			);
		} catch (error) {
			throw toApiError(error);
		}
	}

	/** Asks for permission and subscribes this device. */
	async enablePush(): Promise<PushState> {
		const config = this.#config;
		if (!supportsPush() || !config?.enabled || !config.publicKey) return this.#push;
		const permission = await Notification.requestPermission();
		if (permission !== 'granted') {
			this.#push = permission === 'denied' ? 'denied' : 'off';
			return this.#push;
		}
		const registration = await navigator.serviceWorker.ready;
		const subscription =
			(await registration.pushManager.getSubscription()) ??
			(await registration.pushManager.subscribe({
				userVisibleOnly: true,
				applicationServerKey: keyBytes(config.publicKey)
			}));
		await api.notifications.subscribe(subscription.toJSON());
		this.#push = 'on';
		return this.#push;
	}

	async disablePush() {
		if (!supportsPush()) return;
		const registration = await navigator.serviceWorker.ready;
		const subscription = await registration.pushManager.getSubscription();
		if (subscription) {
			await api.notifications.unsubscribe(subscription.endpoint).catch(() => undefined);
			await subscription.unsubscribe();
		}
		this.#push = 'off';
	}

	/** Number of devices that received the test notification. */
	testPush(): Promise<number> {
		return api.notifications.testPush();
	}

	/** On logout: this device should not receive the old account's reminders. */
	async reset() {
		if (this.#push === 'on') await this.disablePush().catch(() => undefined);
		this.#settings = null;
		this.#config = null;
		this.#push = 'unsupported';
		this.#initialised = false;
	}

	private async refreshPushState(resubscribe: boolean) {
		if (!supportsPush()) {
			this.#push = 'unsupported';
			return;
		}
		if (!this.#config?.enabled) {
			this.#push = 'unavailable';
			return;
		}
		if (Notification.permission === 'denied') {
			this.#push = 'denied';
			return;
		}
		const registration = await navigator.serviceWorker.getRegistration();
		const subscription = await registration?.pushManager.getSubscription();
		if (subscription && Notification.permission === 'granted') {
			if (resubscribe) await api.notifications.subscribe(subscription.toJSON());
			this.#push = 'on';
		} else {
			this.#push = 'off';
		}
	}
}

export const notifications = new NotificationsStore();
