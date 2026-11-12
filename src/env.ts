import { defineEnvVars } from '@sveltejs/kit/env';

/**
 * Environment variables (SvelteKit 3 style). Values are read from `.env`
 * and exposed to the browser via `$app/env/public`.
 */
export const variables = defineEnvVars({
	PUBLIC_USE_MOCK_API: {
		public: true,
		description: 'Set to "false" to use the real REST backend instead of the local mock service.',
		schema: (value) => (value ?? 'true') !== 'false'
	},
	PUBLIC_API_BASE_URL: {
		public: true,
		description: 'Base URL of the Spring Boot REST API.',
		schema: (value) => (value || 'http://localhost:8080/api').replace(/\/$/, '')
	}
});
