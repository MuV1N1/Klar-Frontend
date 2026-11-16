/** Query string ("?a=1&b=2") with some parameters replaced. */
export function withQuery(search: string, values: Record<string, string>): string {
	const params = new URLSearchParams(search);
	for (const [key, value] of Object.entries(values)) params.set(key, value);
	return `?${params}`;
}

/** Query string with every parameter matching `matches` removed and `name=value` set instead. */
export function replaceQueryParam(
	search: string,
	matches: (name: string) => boolean,
	name: string,
	value: string
): string {
	const params = new URLSearchParams(search);
	for (const key of [...params.keys()]) if (matches(key)) params.delete(key);
	params.set(name, value);
	return `?${params}`;
}
