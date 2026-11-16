import { ApiError } from '../errors.ts';
import type { AdminApi } from '../services/types.ts';

const unavailable = () =>
	Promise.reject(new ApiError('Texts can only be edited with the real backend', 'unknown', 501));

/** The texts live in the backend; mock mode can show them but not edit them. */
export const mockAdminApi: AdminApi = {
	translations: unavailable,
	updateTranslation: unavailable
};
