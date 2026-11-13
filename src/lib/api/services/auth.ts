import type { AuthSession, RegisterResult, User } from '#lib/types/index.ts';

import { endpoints } from '../config.ts';
import { ApiError } from '../errors.ts';
import { http, tokenStorage } from '../http.ts';
import type { AuthApi } from './types.ts';

/** REST implementation – talks to the Spring Boot backend. */
export const authApi: AuthApi = {
	async login(input) {
		const session = await http.post<AuthSession>(endpoints.auth.login, input);
		tokenStorage.set(session.accessToken);
		return session;
	},
	register: (input) => http.post<RegisterResult>(endpoints.auth.register, input),
	async verifyEmail(input) {
		const session = await http.post<AuthSession>(endpoints.auth.verifyEmail, input);
		tokenStorage.set(session.accessToken);
		return session;
	},
	resendVerification: (email) => http.post<void>(endpoints.auth.resendVerification, { email }),
	async logout() {
		try {
			await http.post<void>(endpoints.auth.logout);
		} finally {
			tokenStorage.set(null);
		}
	},
	forgotPassword: (email) => http.post<void>(endpoints.auth.forgotPassword, { email }),
	resetPassword: (input) => http.post<void>(endpoints.auth.resetPassword, input),
	async me() {
		if (!tokenStorage.get()) return null;
		try {
			return await http.get<User>(endpoints.auth.me);
		} catch (error) {
			if (error instanceof ApiError && error.code === 'unauthorized') {
				tokenStorage.set(null);
				return null;
			}
			throw error;
		}
	},
	updateProfile: (input) => http.patch<User>(endpoints.profile, input)
};
