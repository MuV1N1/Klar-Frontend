import type { FocusStatus } from '#lib/stores/focus.svelte.ts';

interface LiveTimerPlugin {
	sync(options: {
		status: FocusStatus;
		endsAt: number | null;
		remaining: number;
	}): Promise<unknown>;
}

let plugin: Promise<LiveTimerPlugin> | null = null;

/**
 * Mirrors the focus timer into the phone app's Live Update (HyperOS Super Island, Android 16
 * status bar chip), see android/…/LiveTimerPlugin.java. Does nothing in the browser.
 */
export function syncLiveTimer(status: FocusStatus, endsAt: number | null, remaining: number) {
	const capacitor = (window as { Capacitor?: { isNativePlatform(): boolean } }).Capacitor;
	if (!capacitor?.isNativePlatform()) return;
	plugin ??= import('@capacitor/core').then(({ registerPlugin }) =>
		registerPlugin<LiveTimerPlugin>('LiveTimer')
	);
	void plugin.then((p) => p.sync({ status, endsAt, remaining })).catch(() => undefined);
}
