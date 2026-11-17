import { error } from '@sveltejs/kit';

import { isLocale, type Locale } from '#lib/i18n/index.ts';

import type { LayoutLoad } from './$types';

/** The texts themselves come from the root layout (src/routes/+layout.ts). */
export const load: LayoutLoad = ({ params }) => {
	const locale = params.locale;

	if (!isLocale(locale)) {
		error(404, 'Unsupported locale');
	}

	const selectedLocale: Locale = locale;

	return { locale: selectedLocale };
};
