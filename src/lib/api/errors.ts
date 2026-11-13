export type ApiErrorCode =
	'network' | 'unauthorized' | 'forbidden' | 'not_found' | 'validation' | 'server' | 'unknown';

/** Unified error type thrown by every API service (mock and real). */
export class ApiError extends Error {
	readonly code: ApiErrorCode;
	readonly status: number | null;
	readonly details: unknown;

	constructor(
		message: string,
		code: ApiErrorCode = 'unknown',
		status: number | null = null,
		details?: unknown
	) {
		super(message);
		this.name = 'ApiError';
		this.code = code;
		this.status = status;
		this.details = details;
	}

	static fromStatus(status: number, message?: string, details?: unknown): ApiError {
		const code: ApiErrorCode =
			status === 401
				? 'unauthorized'
				: status === 403
					? 'forbidden'
					: status === 404
						? 'not_found'
						: status === 400 || status === 422
							? 'validation'
							: status >= 500
								? 'server'
								: 'unknown';

		return new ApiError(message ?? `Request failed with status ${status}`, code, status, details);
	}
}

export function toApiError(error: unknown): ApiError {
	if (error instanceof ApiError) return error;
	if (error instanceof TypeError) {
		return new ApiError('Network error', 'network', null, error);
	}
	return new ApiError(
		error instanceof Error ? error.message : 'Unknown error',
		'unknown',
		null,
		error
	);
}

/** Machine-readable error code sent by the backend (e.g. `email_not_verified`, `invalid_code`). */
export function apiErrorCode(error: unknown): string | null {
	if (!(error instanceof ApiError)) return null;
	const details = error.details;
	if (details && typeof details === 'object' && 'code' in details) {
		const code = (details as { code: unknown }).code;
		return typeof code === 'string' ? code : null;
	}
	return null;
}
