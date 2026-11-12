import type { Handle } from '@sveltejs/kit/hooks';

import { DEFAULT_LOCALE, isLocale } from '#lib/i18n/index.ts';

/** Sets the <html lang> attribute from the [locale] route parameter. */
export const handle: Handle = async ({ event, resolve }) => {
	const locale = event.params.locale;
	const lang = isLocale(locale) ? locale : DEFAULT_LOCALE;

	return resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%lang%', lang)
	});
};
