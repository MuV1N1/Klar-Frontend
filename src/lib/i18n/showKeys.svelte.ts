import { page } from '$app/state';

import { withQuery } from '#lib/utils/url.ts';

type PageUrl = typeof page.url;

/**
 * Key mode: `?showKeys=1` renders every text as its key (e.g. `calendar.event.new`), so an admin
 * can find it in the text editor. The tab remembers it while navigating; `?showKeys=0` ends it.
 */
export const SHOW_KEYS_PARAM = 'showKeys';
const STORAGE_KEY = 'klar.showKeys';

/** `true`/`false` when the URL says so, `null` when it does not mention key mode. */
function fromUrl(url: PageUrl): boolean | null {
	const value = url.searchParams.get(SHOW_KEYS_PARAM);
	if (value === null) return null;
	return ['', '1', 'true', 'yes', 'ja'].includes(value.toLowerCase());
}

/**
 * Call during component init. Per component, not module state: on the server a module-level
 * flag would leak between requests.
 */
export function useShowKeys(): () => boolean {
	let remembered = $state(false);

	$effect(() => {
		const fromParam = fromUrl(page.url);
		try {
			if (fromParam === null) {
				remembered = sessionStorage.getItem(STORAGE_KEY) === '1';
			} else {
				remembered = fromParam;
				if (fromParam) sessionStorage.setItem(STORAGE_KEY, '1');
				else sessionStorage.removeItem(STORAGE_KEY);
			}
		} catch {
			remembered = fromParam ?? false;
		}
	});

	return () => fromUrl(page.url) ?? remembered;
}

/** The current URL with key mode switched off. */
export function withoutShowKeys(url: PageUrl): string {
	return `${url.pathname}${withQuery(url.search, { [SHOW_KEYS_PARAM]: '0' })}${url.hash}`;
}
