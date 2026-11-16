/** Query string ("?a=1&b=2") with some parameters replaced. */
export function withQuery(search: string, values: Record<string, string>): string {
	const params = new URLSearchParams(search);
	for (const [key, value] of Object.entries(values)) params.set(key, value);
	return `?${params}`;
}
