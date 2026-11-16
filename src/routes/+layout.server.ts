import { DEFAULT_LOCALE, isLocale, type Messages } from '#lib/i18n/index.ts';
import { loadMessages } from '#lib/server/i18n.ts';

import type { LayoutServerLoad } from './$types';

/**
 * Texts for every page, including the error page (an unknown locale renders with the default one).
 * `invalidate('klar:i18n')` reloads them, e.g. after an admin edited a text.
 */
export const load: LayoutServerLoad = async ({ params, url, route, depends, untrack }) => {
	depends('klar:i18n');
	// Reading `url` or `route` directly would rerun this on every navigation.
	const { origin, routeId } = untrack(() => ({ origin: new URL(url.origin), routeId: route.id }));
	// `/` only redirects to /de or /en
	if (routeId === '/') return { messages: {} as Messages };

	const locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
	return { messages: await loadMessages(locale, origin) };
};
