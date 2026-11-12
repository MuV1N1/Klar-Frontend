import { browser } from '$app/env';

import { apiConfig } from './config.ts';
import { ApiError, toApiError } from './errors.ts';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions {
	method?: HttpMethod;
	body?: unknown;
	signal?: AbortSignal;
}

/** Token storage – swap for cookies/httpOnly sessions once the backend decides. */
export const tokenStorage = {
	get(): string | null {
		if (!browser) return null;
		try {
			return localStorage.getItem(apiConfig.tokenStorageKey);
		} catch {
			return null;
		}
	},
	set(token: string | null) {
		if (!browser) return;
		try {
			if (token) localStorage.setItem(apiConfig.tokenStorageKey, token);
			else localStorage.removeItem(apiConfig.tokenStorageKey);
		} catch {
			/* ignore storage errors */
		}
	}
};

/**
 * Thin fetch wrapper used by the real API services.
 * Adds JSON handling, the bearer token and converts failures into ApiError.
 */
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
	const { method = 'GET', body, signal } = options;
	const headers: Record<string, string> = { Accept: 'application/json' };

	if (body !== undefined) headers['Content-Type'] = 'application/json';

	const token = tokenStorage.get();
	if (token) headers.Authorization = `Bearer ${token}`;

	let response: Response;
	try {
		response = await fetch(`${apiConfig.baseUrl}${path}`, {
			method,
			headers,
			body: body === undefined ? undefined : JSON.stringify(body),
			signal,
			credentials: 'include'
		});
	} catch (error) {
		throw toApiError(error);
	}

	if (!response.ok) {
		let details: unknown = null;
		try {
			details = await response.json();
		} catch {
			/* no JSON body */
		}
		const message =
			details && typeof details === 'object' && 'message' in details
				? String((details as { message: unknown }).message)
				: undefined;
		throw ApiError.fromStatus(response.status, message, details);
	}

	if (response.status === 204) return undefined as T;

	return (await response.json()) as T;
}

export const http = {
	get: <T>(path: string, signal?: AbortSignal) => request<T>(path, { signal }),
	post: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body }),
	put: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PUT', body }),
	patch: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body }),
	delete: <T>(path: string) => request<T>(path, { method: 'DELETE' })
};
