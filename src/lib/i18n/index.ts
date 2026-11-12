import { getContext } from 'svelte';

import de from './locales/de.json';
import en from './locales/en.json';

export type Locale = 'de' | 'en';

export const LOCALES: readonly Locale[] = ['de', 'en'];
export const DEFAULT_LOCALE: Locale = 'de';

export const LOCALE_NAMES: Record<Locale, string> = {
	de: 'Deutsch',
	en: 'English'
};

export type TranslationDictionary = {
	[key: string]: string | TranslationDictionary;
};

export type TranslationVariables = Record<string, string | number>;

export type Translator = (key: string, variables?: TranslationVariables) => string;

export const I18N_CONTEXT = Symbol('i18n');
export const LOCALE_CONTEXT = Symbol('locale');

const dictionaries: Record<Locale, TranslationDictionary> = {
	de,
	en
};

export function isLocale(value: unknown): value is Locale {
	return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

export function getTranslations(locale: Locale): TranslationDictionary {
	return dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];
}

/**
 * Resolves a dotted key like `dashboard.title` and interpolates `{variables}`.
 * Plural forms are objects with `zero` / `one` / `other` (Intl.PluralRules categories)
 * and are selected by the `count` variable.
 */
export function translate(
	translations: TranslationDictionary,
	locale: Locale,
	key: string,
	variables: TranslationVariables = {}
): string {
	const value = key
		.split('.')
		.reduce<string | TranslationDictionary | undefined>(
			(current, part) =>
				typeof current === 'object' && current !== undefined ? current[part] : undefined,
			translations
		);

	if (typeof value === 'string') {
		return interpolate(value, variables);
	}

	if (value && typeof variables.count === 'number') {
		const count = variables.count;
		const pluralCategory = new Intl.PluralRules(locale).select(count);
		const pluralValue =
			(count === 0 ? value.zero : undefined) ?? value[pluralCategory] ?? value.other;

		if (typeof pluralValue === 'string') {
			return interpolate(pluralValue, variables);
		}
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
