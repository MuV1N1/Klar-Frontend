/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />
/// <reference types="@sveltejs/kit" />

/**
 * Shows push notifications (reminders from the backend) and opens the app when one is tapped.
 * No offline caching: the app needs the API anyway.
 */
const sw = self as unknown as ServiceWorkerGlobalScope;

interface PushPayload {
	title: string;
	body: string;
	/** Path inside the app, e.g. /de/app/calendar?date=2026-11-20 */
	url: string | null;
	/** A newer notification with the same tag replaces the older one. */
	tag: string | null;
}

sw.addEventListener('install', () => void sw.skipWaiting());

sw.addEventListener('activate', (event) => event.waitUntil(sw.clients.claim()));

sw.addEventListener('push', (event) => {
	let payload: PushPayload = { title: 'Klar', body: '', url: null, tag: null };
	try {
		payload = { ...payload, ...(event.data?.json() as Partial<PushPayload>) };
	} catch {
		if (event.data) payload.body = event.data.text();
	}
	event.waitUntil(
		sw.registration.showNotification(payload.title, {
			body: payload.body,
			tag: payload.tag ?? undefined,
			icon: '/icon-192.png',
			badge: '/icon-192.png',
			data: { url: payload.url }
		})
	);
});

sw.addEventListener('notificationclick', (event) => {
	event.notification.close();
	const path = (event.notification.data as { url?: string | null } | null)?.url ?? '/';
	const url = new URL(path, sw.location.origin).href;
	event.waitUntil(
		(async () => {
			const windows = await sw.clients.matchAll({ type: 'window', includeUncontrolled: true });
			const existing = windows.find((client) => new URL(client.url).origin === sw.location.origin);
			if (existing) {
				await existing.focus();
				await existing.navigate(url).catch(() => undefined);
			} else {
				await sw.clients.openWindow(url);
			}
		})()
	);
});
