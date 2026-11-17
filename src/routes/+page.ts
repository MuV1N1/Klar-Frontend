import { redirect } from '@sveltejs/kit';

import { browser } from '$app/env';

import { DEFAULT_LOCALE, isLocale } from '#lib/i18n/index.ts';

import type { PageLoad } from './$types';

/** `/` → `/de` or `/en`, based on the device language. On the server hooks.server.ts redirects first. */
export const load: PageLoad = () => {
	const preferred = browser ? navigator.language.toLowerCase().slice(0, 2) : '';
	redirect(302, `/${isLocale(preferred) ? preferred : DEFAULT_LOCALE}`);
};
