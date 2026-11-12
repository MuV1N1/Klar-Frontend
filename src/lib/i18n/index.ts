
import { getContext } from 'svelte';

import de from './locales/de.json';
import en from './locales/en.json';

export type Locale = 'de' | 'en';

export type TranslationDictionary = {
    [key: string]: string | TranslationDictionary;
};

export type TranslationVariables = Record<string, string | number>;

export type Translator = (
    key: string,
    variables?: TranslationVariables
) => string;

export const I18N_CONTEXT = Symbol('i18n');

const dictionaries: Record<Locale, TranslationDictionary> = {
    de,
    en
};

export function getTranslations(locale: Locale): TranslationDictionary {
    return dictionaries[locale] ?? dictionaries.de;
}

export function translate(
    translations: TranslationDictionary,
    locale: Locale,
    key: string,
    variables: TranslationVariables = {}
): string {
    const value = key.split('.').reduce<
        string | TranslationDictionary | undefined
    >((current, part) => {
        if (typeof current !== 'object' || current === undefined) {
            return undefined;
        }

        return current[part];
    }, translations);

    if (typeof value === 'string') {
        return interpolate(value, variables);
    }

    if (value && typeof variables.count === 'number') {
        const pluralCategory = new Intl.PluralRules(locale).select(
            variables.count
        );

        const pluralValue =
            value[pluralCategory] ?? value.other;

        if (typeof pluralValue === 'string') {
            return interpolate(pluralValue, variables);
        }
    }

    console.warn(`[i18n] Missing translation: ${key}`);

    return `[${key}]`;
}

function interpolate(
    message: string,
    variables: TranslationVariables
): string {
    return message.replace(/\{(\w+)\}/g, (match, variable: string) => {
        return variable in variables
            ? String(variables[variable])
            : match;
    });
}

export function useTranslations(): Translator {
    const translator = getContext<Translator>(I18N_CONTEXT);

    if (!translator) {
        throw new Error(
            '[i18n] Translation context is missing. Check your layout.'
        );
    }

    return translator;
}
