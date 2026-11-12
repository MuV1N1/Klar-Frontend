import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

import { getTranslations, type Locale } from '#lib/i18n/index.ts';

export const load: LayoutServerLoad = ({ params }) => {
	const locale = params.locale;

	if (locale !== 'de' && locale !== 'en') {
		throw error(404, 'Unsupported locale');
	}

	const selectedLocale: Locale = locale;

	return {
		locale: selectedLocale,
		translations: getTranslations(selectedLocale)
	};
};
