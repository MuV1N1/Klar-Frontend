import type { AuthSession, User } from '#lib/types/index.ts';

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
	async register(input) {
		const session = await http.post<AuthSession>(endpoints.auth.register, input);
		tokenStorage.set(session.accessToken);
		return session;
	},
	async logout() {
		try {
			await http.post<void>(endpoints.auth.logout);
		} finally {
			tokenStorage.set(null);
		}
	},
	forgotPassword: (email) => http.post<void>(endpoints.auth.forgotPassword, { email }),
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
