import { getContext } from 'svelte';

export type Locale = 'de' | 'en';

export const LOCALES: readonly Locale[] = ['de', 'en'];
export const DEFAULT_LOCALE: Locale = 'de';

export const LOCALE_NAMES: Record<Locale, string> = {
	de: 'Deutsch',
	en: 'English'
};

/**
 * All texts of one language, flat: `{ "calendar.event.new": "Neuer Termin", … }`.
 * They come from the backend (`GET /api/i18n/<locale>`, see `$lib/server/i18n.ts`); admins can
 * edit them under /app/admin/translations.
 */
export type Messages = Record<string, string>;

export type TranslationVariables = Record<string, string | number>;

export type Translator = (key: string, variables?: TranslationVariables) => string;

export const I18N_CONTEXT = Symbol('i18n');
export const LOCALE_CONTEXT = Symbol('locale');

export function isLocale(value: unknown): value is Locale {
	return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

/**
 * Looks up a key like `dashboard.title` and interpolates `{variables}`.
 * Plural forms are separate keys ending in `.zero` / `.one` / `.other` (Intl.PluralRules
 * categories) and are selected by the `count` variable.
 */
export function translate(
	messages: Messages,
	locale: Locale,
	key: string,
	variables: TranslationVariables = {}
): string {
	let message = messages[key];

	if (message === undefined && typeof variables.count === 'number') {
		const count = variables.count;
		const category = new Intl.PluralRules(locale).select(count);
		message =
			(count === 0 ? messages[`${key}.zero`] : undefined) ??
			messages[`${key}.${category}`] ??
			messages[`${key}.other`];
	}

	if (message !== undefined) {
		return interpolate(message, variables);
	}

	console.warn(`[i18n] Missing translation: ${key}`);

	return `[${key}]`;
}

function interpolate(message: string, variables: TranslationVariables): string {
	return message.replace(/\{(\w+)\}/g, (match, variable: string) =>
		variable in variables ? String(variables[variable]) : match
	);
}

/** Returns the translator provided by the `[locale]` layout. */
export function useTranslations(): Translator {
	const translator = getContext<Translator>(I18N_CONTEXT);

	if (!translator) {
		throw new Error('[i18n] Translation context is missing. Check your layout.');
	}

	return translator;
}

/** Returns a getter for the active locale (reactive when read inside templates/effects). */
export function useLocale(): () => Locale {
	const locale = getContext<() => Locale>(LOCALE_CONTEXT);

	if (!locale) {
		throw new Error('[i18n] Locale context is missing. Check your layout.');
	}

	return locale;
}

/** Builds a locale-prefixed path: localizedHref('de', '/app') → '/de/app'. */
export function localizedHref(locale: Locale, path = '/'): string {
	const normalized = path.startsWith('/') ? path : `/${path}`;
	return normalized === '/' ? `/${locale}` : `/${locale}${normalized}`;
}

/** Swaps the locale segment of a pathname, keeping the rest of the path. */
export function switchLocaleInPath(pathname: string, locale: Locale): string {
	const parts = pathname.split('/');
	if (isLocale(parts[1])) {
		parts[1] = locale;
		return parts.join('/');
	}
	return localizedHref(locale, pathname);
}
