import { browser } from '$app/env';

/** Tiny localStorage wrapper so the mock data survives reloads. */
export function readStorage<T>(key: string, fallback: () => T): T {
	if (!browser) return fallback();
	try {
		const raw = localStorage.getItem(key);
		return raw ? (JSON.parse(raw) as T) : fallback();
	} catch {
		return fallback();
	}
}

export function writeStorage<T>(key: string, value: T): void {
	if (!browser) return;
	try {
		localStorage.setItem(key, JSON.stringify(value));
	} catch {
		/* ignore quota / privacy mode errors */
	}
}

export function removeStorage(key: string): void {
	if (!browser) return;
	try {
		localStorage.removeItem(key);
	} catch {
		/* ignore */
	}
}

/** Simulates network latency so loading states are visible during development. */
export function delay(ms = 180 + Math.random() * 220): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export const MOCK_KEYS = {
	tasks: 'klar.mock.tasks',
	lists: 'klar.mock.lists',
	session: 'klar.mock.session',
	users: 'klar.mock.users'
} as const;
