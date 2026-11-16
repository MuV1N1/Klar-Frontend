import { error } from '@sveltejs/kit';

import { API_INTERNAL_URL } from '$app/env/private';
import { PUBLIC_API_BASE_URL } from '$app/env/public';

import type { Locale, Messages } from '#lib/i18n/index.ts';

interface Cached {
	etag: string | null;
	messages: Messages;
}

/** Last good catalog per locale; also served while the backend is briefly unreachable (deploys). */
const cache = new Map<Locale, Cached>();
/** One request per locale at a time, however many pages render concurrently. */
const pending = new Map<Locale, Promise<Messages>>();

function baseUrl(requestUrl: URL): string {
	return API_INTERNAL_URL ?? new URL(PUBLIC_API_BASE_URL, requestUrl).href.replace(/\/$/, '');
}

/**
 * Texts of a locale from the backend. Revalidated on every call with the ETag, so an admin's
 * change shows on the next page load; usually that is a cheap 304.
 */
export function loadMessages(locale: Locale, requestUrl: URL): Promise<Messages> {
	let request = pending.get(locale);
	if (!request) {
		request = refresh(locale, requestUrl).finally(() => pending.delete(locale));
		pending.set(locale, request);
	}
	return request;
}

async function refresh(locale: Locale, requestUrl: URL): Promise<Messages> {
	const cached = cache.get(locale);
	try {
		const response = await fetch(`${baseUrl(requestUrl)}/i18n/${locale}`, {
			headers: {
				Accept: 'application/json',
				...(cached?.etag ? { 'If-None-Match': cached.etag } : {})
			},
			signal: AbortSignal.timeout(3000)
		});
		if (response.status === 304 && cached) return cached.messages;
		if (!response.ok) throw new Error(`HTTP ${response.status}`);

		const body = (await response.json()) as { messages: Messages };
		cache.set(locale, { etag: response.headers.get('etag'), messages: body.messages });
		return body.messages;
	} catch (cause) {
		if (cached) {
			console.warn(`[i18n] Backend unreachable, using cached texts for ${locale}:`, cause);
			return cached.messages;
		}
		console.error(`[i18n] Could not load texts for ${locale}:`, cause);
		// No texts at all: SvelteKit falls back to src/error.html.
		error(503, 'Texts are unavailable');
	}
}
