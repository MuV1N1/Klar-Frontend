import { redirect } from '@sveltejs/kit';

import { DEFAULT_LOCALE, isLocale } from '#lib/i18n/index.ts';

import type { PageServerLoad } from './$types';

/** `/` → `/de` or `/en`, based on the browser language. */
export const load: PageServerLoad = ({ request }) => {
	const acceptLanguage = request.headers.get('accept-language') ?? '';
	const preferred = acceptLanguage.toLowerCase().slice(0, 2);
	const locale = isLocale(preferred) ? preferred : DEFAULT_LOCALE;

	redirect(302, `/${locale}`);
};
