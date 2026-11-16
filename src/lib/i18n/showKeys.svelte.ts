import { browser } from '$app/env';
import { page } from '$app/state';

import { auth } from '#lib/stores/auth.svelte.ts';
import { replaceQueryParam } from '#lib/utils/url.ts';

type PageUrl = typeof page.url;

/**
 * Key mode for admins: `?showKeys=1` renders every text as its key (e.g. `calendar.event.new`),
 * so it can be found in the text editor. The parameter is case-insensitive (`?showkeys=1` works
 * too). The tab remembers it while navigating; `?showKeys=0` ends it.
 *
 * Only the browser knows whether the user is an admin (the token lives there), so the server
 * always renders texts and the keys appear once the session is restored.
 */
export const SHOW_KEYS_PARAM = 'showKeys';
const STORAGE_KEY = 'klar.showKeys';

function isShowKeysParam(name: string): boolean {
	return name.toLowerCase() === SHOW_KEYS_PARAM.toLowerCase();
}

/** `true`/`false` when the URL says so, `null` when it does not mention key mode. */
function fromUrl(url: PageUrl): boolean | null {
	const entry = [...url.searchParams].find(([name]) => isShowKeysParam(name));
	if (!entry) return null;
	return ['', '1', 'true', 'yes', 'ja'].includes(entry[1].toLowerCase());
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
		// Outside /app nobody restores the session; needed to know whether this is an admin.
		if (remembered) void auth.initialise();
	});

	return () => browser && auth.user?.role === 'admin' && (fromUrl(page.url) ?? remembered);
}

/** The current URL with key mode switched off (any spelling of the parameter replaced). */
export function withoutShowKeys(url: PageUrl): string {
	return `${url.pathname}${replaceQueryParam(url.search, isShowKeysParam, SHOW_KEYS_PARAM, '0')}${url.hash}`;
}
