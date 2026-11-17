import { error } from '@sveltejs/kit';

import { PUBLIC_API_BASE_URL } from '$app/env/public';

import { DEFAULT_LOCALE, isLocale, type Messages } from '#lib/i18n/index.ts';

import type { LayoutLoad } from './$types';

/** The phone app (`vite build --mode app`) is a static SPA inside Capacitor, without a Node server. */
export const ssr = import.meta.env.MODE !== 'app';

/**
 * Texts for every page, including the error page (an unknown locale renders with the default one).
 * On the server `handleFetch` (hooks.server.ts) answers this from its cache; in the browser and the
 * app it goes straight to the backend. `invalidate('klar:i18n')` reloads them, e.g. after an admin
 * edited a text.
 */
export const load: LayoutLoad = async ({ params, route, fetch, depends, untrack }) => {
	depends('klar:i18n');
	// Reading `route` directly would rerun this on every navigation.
	const routeId = untrack(() => route.id);
	// `/` only redirects to /de or /en
	if (routeId === '/') return { messages: {} as Messages };

	const locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
	const response = await fetch(`${PUBLIC_API_BASE_URL}/i18n/${locale}`, {
		headers: { Accept: 'application/json' }
	}).catch(() => undefined);
	// No texts at all: SvelteKit falls back to src/error.html.
	if (!response?.ok) error(503, 'Texts are unavailable');

	const body = (await response.json()) as { messages: Messages };
	return { messages: body.messages };
};
