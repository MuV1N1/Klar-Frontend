import { api } from '#lib/api/index.ts';
import { toApiError } from '#lib/api/errors.ts';
import type { LoginInput, RegisterInput, UpdateProfileInput, User } from '#lib/types/index.ts';

export type AuthStatus = 'unknown' | 'anonymous' | 'authenticated';

class AuthStore {
	#user = $state<User | null>(null);
	#status = $state<AuthStatus>('unknown');
	#initialising: Promise<void> | null = null;

	get user(): User | null {
		return this.#user;
	}

	get status(): AuthStatus {
		return this.#status;
	}

	get isAuthenticated(): boolean {
		return this.#status === 'authenticated';
	}

	/** Restores the session (idempotent). */
	initialise(): Promise<void> {
		if (this.#status !== 'unknown') return Promise.resolve();
		if (!this.#initialising) {
			this.#initialising = api.auth
				.me()
				.then((user) => this.setUser(user))
				.catch(() => this.setUser(null))
				.finally(() => (this.#initialising = null));
		}
		return this.#initialising;
	}

	async login(input: LoginInput) {
		try {
			const session = await api.auth.login(input);
			this.setUser(session.user);
		} catch (error) {
			throw toApiError(error);
		}
	}

	async register(input: RegisterInput) {
		try {
			const session = await api.auth.register(input);
			this.setUser(session.user);
		} catch (error) {
			throw toApiError(error);
		}
	}

	async forgotPassword(email: string) {
		try {
			await api.auth.forgotPassword(email);
		} catch (error) {
			throw toApiError(error);
		}
	}

	async logout() {
		try {
			await api.auth.logout();
		} finally {
			this.setUser(null);
		}
	}

	async updateProfile(input: UpdateProfileInput) {
		try {
			this.#user = await api.auth.updateProfile(input);
		} catch (error) {
			throw toApiError(error);
		}
	}

	private setUser(user: User | null) {
		this.#user = user;
		this.#status = user ? 'authenticated' : 'anonymous';
	}
}

export const auth = new AuthStore();
