import type { FocusStatus, FocusTarget } from '#lib/stores/focus.svelte.ts';
import { lists } from '#lib/stores/lists.svelte.ts';
import { tasks } from '#lib/stores/tasks.svelte.ts';

interface LiveTimerOptions {
	status: FocusStatus;
	endsAt: number | null;
	remaining: number;
	total: number;
	/** Task or list name; the app shows "Focus" without one. */
	title: string | null;
}

interface LiveTimerPlugin {
	sync(options: LiveTimerOptions): Promise<unknown>;
}

let plugin: LiveTimerPlugin | null = null;

/**
 * Mirrors the focus timer into the phone app's Live Update (HyperOS Super Island, Android 16
 * status bar chip), see android/…/LiveTimerPlugin.java. Does nothing in the browser.
 */
export function syncLiveTimer(
	status: FocusStatus,
	endsAt: number | null,
	remaining: number,
	total: number,
	target: FocusTarget
) {
	const capacitor = (window as { Capacitor?: { isNativePlatform(): boolean } }).Capacitor;
	if (!capacitor?.isNativePlatform()) return;
	const title = lists.byId(target.listId)?.name ?? tasks.byId(target.taskId)?.title ?? null;
	// The plugin proxy must never be a promise's result: resolving it calls proxy.then(), which
	// Capacitor treats as a native method and rejects.
	void import('@capacitor/core')
		.then(({ registerPlugin }) => {
			plugin ??= registerPlugin<LiveTimerPlugin>('LiveTimer');
			return plugin.sync({ status, endsAt, remaining, total, title });
		})
		.catch((error: unknown) => console.warn('[liveTimer]', error));
}
