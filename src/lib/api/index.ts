import { apiConfig } from './config.ts';
import { mockApi } from './mock/index.ts';
import { authApi } from './services/auth.ts';
import { listsApi } from './services/lists.ts';
import { tasksApi } from './services/tasks.ts';
import type { Api } from './services/types.ts';

const restApi: Api = {
	tasks: tasksApi,
	lists: listsApi,
	auth: authApi
};

/**
 * The single API entry point used by the stores.
 * Switch `PUBLIC_USE_MOCK_API=false` in `.env` to talk to the real backend.
 */
export const api: Api = apiConfig.useMock ? mockApi : restApi;

export { ApiError } from './errors.ts';
export type { Api, AuthApi, ListsApi, TasksApi } from './services/types.ts';
