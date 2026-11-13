import { PUBLIC_API_BASE_URL, PUBLIC_USE_MOCK_API } from '$app/env/public';

/**
 * Central API configuration.
 *
 * - `PUBLIC_USE_MOCK_API` (default: true) switches between the local mock
 *   service and the real REST client.
 * - `PUBLIC_API_BASE_URL` is the base URL of the Spring Boot backend.
 *
 * Both are declared in `src/env.ts` and configured via `.env` (see `.env.example`).
 */
export const apiConfig = {
	useMock: PUBLIC_USE_MOCK_API,
	baseUrl: PUBLIC_API_BASE_URL,
	/** Storage key for the auth token (used by the HTTP client). */
	tokenStorageKey: 'klar.accessToken'
} as const;

/**
 * REST endpoints the frontend expects from the backend.
 * Kept in one place so they can be adjusted when the backend is ready.
 * See docs/BACKEND_INTEGRATION.md for the full contract.
 */
export const endpoints = {
	auth: {
		login: '/auth/login',
		register: '/auth/register',
		verifyEmail: '/auth/verify-email',
		resendVerification: '/auth/resend-verification',
		logout: '/auth/logout',
		forgotPassword: '/auth/forgot-password',
		resetPassword: '/auth/reset-password',
		me: '/auth/me'
	},
	tasks: {
		collection: '/tasks',
		item: (id: string) => `/tasks/${encodeURIComponent(id)}`
	},
	lists: {
		collection: '/lists',
		item: (id: string) => `/lists/${encodeURIComponent(id)}`
	},
	profile: '/users/me'
} as const;
