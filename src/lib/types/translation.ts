import type { Locale } from '#lib/i18n/index.ts';

/** One text in all languages, as the admin translation editor shows it. */
export interface TranslationEntry {
	key: string;
	/** Default text shipped with the backend. */
	defaults: Record<Locale, string>;
	/** Text changed by an admin; missing when the default applies. */
	overrides: Partial<Record<Locale, string>>;
}
