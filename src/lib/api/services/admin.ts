import type { TranslationEntry } from '#lib/types/index.ts';

import { endpoints } from '../config.ts';
import { http } from '../http.ts';
import type { AdminApi } from './types.ts';

/** REST implementation – talks to the Spring Boot backend. */
export const adminApi: AdminApi = {
	translations: () => http.get<TranslationEntry[]>(endpoints.admin.translations),
	updateTranslation: (locale, key, value) =>
		http.put<TranslationEntry>(endpoints.admin.translations, { locale, key, value })
};
