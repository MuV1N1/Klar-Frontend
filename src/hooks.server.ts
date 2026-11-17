import { redirect } from '@sveltejs/kit';
import type { Handle, HandleFetch } from '@sveltejs/kit/hooks';

import { PUBLIC_API_BASE_URL } from '$app/env/public';

import { DEFAULT_LOCALE, isLocale } from '#lib/i18n/index.ts';
import { loadMessages } from '#lib/server/i18n.ts';

/** `/` → `/de` or `/en` from `accept-language`; sets the <html lang> attribute from the [locale] route parameter. */
export const handle: Handle = async ({ event, resolve }) => {
	if (event.url.pathname === '/') {
		const preferred = (event.request.headers.get('accept-language') ?? '')
			.toLowerCase()
			.slice(0, 2);
		redirect(302, `/${isLocale(preferred) ? preferred : DEFAULT_LOCALE}`);
	}

	const locale = event.params.locale;
	const lang = isLocale(locale) ? locale : DEFAULT_LOCALE;

	return resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%lang%', lang)
	});
};

/** Texts requested during SSR come from the server-side cache (see $lib/server/i18n.ts). */
export const handleFetch: HandleFetch = async ({ event, request, fetch }) => {
	const prefix = new URL(`${PUBLIC_API_BASE_URL}/i18n/`, event.url).href;
	const locale = request.url.startsWith(prefix) ? request.url.slice(prefix.length) : null;
	if (!isLocale(locale)) return fetch(request);

	const messages = await loadMessages(locale, event.url);
	// The texts are public; without this SvelteKit's CORS check rejects an absolute (cross-origin) API URL.
	return Response.json({ messages }, { headers: { 'Access-Control-Allow-Origin': '*' } });
};
