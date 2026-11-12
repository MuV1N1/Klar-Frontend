import { error } from '@sveltejs/kit';

import { getTranslations, isLocale, type Locale } from '#lib/i18n/index.ts';

import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ params }) => {
	const locale = params.locale;

	if (!isLocale(locale)) {
		error(404, 'Unsupported locale');
	}

	const selectedLocale: Locale = locale;

	return {
		locale: selectedLocale,
		translations: getTranslations(selectedLocale)
	};
};
