import { browser } from '$app/env';

import type { TaskPriority } from '#lib/types/index.ts';

export type Theme = 'light' | 'dark' | 'system';
export type WeekStart = 'monday' | 'sunday';

export interface Settings {
	theme: Theme;
	defaultListId: string | null;
	defaultPriority: TaskPriority;
	showCompletedOnDashboard: boolean;
	confirmDelete: boolean;
	weekStart: WeekStart;
	focusMinutes: number;
}

const STORAGE_KEY = 'klar.settings';
/** Read by the inline script in app.html to avoid a flash of the wrong theme. */
const THEME_KEY = 'klar.theme';

const DEFAULTS: Settings = {
	theme: 'system',
	defaultListId: null,
	defaultPriority: 'normal',
	showCompletedOnDashboard: true,
	confirmDelete: true,
	weekStart: 'monday',
	focusMinutes: 25
};

function load(): Settings {
	if (!browser) return DEFAULTS;
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? { ...DEFAULTS, ...(JSON.parse(raw) as Partial<Settings>) } : DEFAULTS;
	} catch {
		return DEFAULTS;
	}
}

class SettingsStore {
	#settings = $state<Settings>(DEFAULTS);
	#hydrated = false;

	get value(): Settings {
		return this.#settings;
	}

	get theme(): Theme {
		return this.#settings.theme;
	}

	/** Must be called once in the browser (root layout). */
	hydrate() {
		if (this.#hydrated || !browser) return;
		this.#hydrated = true;
		this.#settings = load();
		this.applyTheme();

		const media = window.matchMedia('(prefers-color-scheme: dark)');
		media.addEventListener('change', () => {
			if (this.#settings.theme === 'system') this.applyTheme();
		});
	}

	update(patch: Partial<Settings>) {
		this.#settings = { ...this.#settings, ...patch };
		if (!browser) return;
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(this.#settings));
			localStorage.setItem(THEME_KEY, this.#settings.theme);
		} catch {
			/* ignore */
		}
		if (patch.theme !== undefined) this.applyTheme();
	}

	setTheme(theme: Theme) {
		this.update({ theme });
	}

	get resolvedTheme(): 'light' | 'dark' {
		if (this.#settings.theme !== 'system') return this.#settings.theme;
		if (!browser) return 'light';
		return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
	}

	private applyTheme() {
		if (!browser) return;
		const root = document.documentElement;
		const dark = this.resolvedTheme === 'dark';
		if (root.classList.contains('dark') === dark) return;

		// Switch every colour in the same frame: element transitions are paused while the
		// theme class changes, otherwise buttons and cards fade later than the background.
		root.classList.add('theme-switching');
		root.classList.toggle('dark', dark);
		void root.offsetHeight; // force a style flush with transitions disabled
		requestAnimationFrame(() =>
			requestAnimationFrame(() => root.classList.remove('theme-switching'))
		);
	}
}

export const settings = new SettingsStore();
