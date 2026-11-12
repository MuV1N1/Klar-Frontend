import type { AuthSession, User } from '#lib/types/index.ts';
import { createId } from '#lib/utils/id.ts';

import { ApiError } from '../errors.ts';
import type { AuthApi } from '../services/types.ts';
import { DEMO_USER } from './seed.ts';
import { MOCK_KEYS, delay, readStorage, removeStorage, writeStorage } from './storage.ts';

/**
 * Demo authentication. Any email/password combination signs you in; the
 * "account" is stored locally. Nothing here is secure – it only exists so the
 * UI flows can be tried out before the Spring Boot backend is available.
 */
function loadUsers(): User[] {
	return readStorage<User[]>(MOCK_KEYS.users, () => [DEMO_USER]);
}

function loadSession(): AuthSession | null {
	return readStorage<AuthSession | null>(MOCK_KEYS.session, () => null);
}

function startSession(user: User): AuthSession {
	const session: AuthSession = { user, accessToken: `mock-token-${createId()}` };
	writeStorage(MOCK_KEYS.session, session);
	return session;
}

function validateEmail(email: string) {
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
		throw new ApiError('Invalid email address', 'validation', 400);
	}
}

export const mockAuthApi: AuthApi = {
	async login({ email, password }) {
		await delay(400);
		validateEmail(email);
		if (!password) throw new ApiError('Password is required', 'validation', 400);

		const normalized = email.trim().toLowerCase();
		let user = loadUsers().find((u) => u.email.toLowerCase() === normalized);
		if (!user) {
			user = {
				id: createId('user'),
				name: normalized.split('@')[0],
				email: normalized,
				createdAt: new Date().toISOString()
			};
			writeStorage(MOCK_KEYS.users, [...loadUsers(), user]);
		}
		return startSession(user);
	},

	async register({ name, email, password }) {
		await delay(400);
		validateEmail(email);
		if (!name.trim()) throw new ApiError('Name is required', 'validation', 400);
		if (password.length < 8) throw new ApiError('Password too short', 'validation', 400);

		const normalized = email.trim().toLowerCase();
		const users = loadUsers().filter((u) => u.email.toLowerCase() !== normalized);
		const user: User = {
			id: createId('user'),
			name: name.trim(),
			email: normalized,
			createdAt: new Date().toISOString()
		};
		writeStorage(MOCK_KEYS.users, [...users, user]);
		return startSession(user);
	},

	async logout() {
		await delay(120);
		removeStorage(MOCK_KEYS.session);
	},

	async forgotPassword(email) {
		await delay(400);
		validateEmail(email);
	},

	async me() {
		await delay(80);
		return loadSession()?.user ?? null;
	},

	async updateProfile(input) {
		await delay();
		const session = loadSession();
		if (!session) throw new ApiError('Not signed in', 'unauthorized', 401);

		const user: User = {
			...session.user,
			name: input.name?.trim() || session.user.name,
			email: input.email?.trim().toLowerCase() || session.user.email
		};
		writeStorage(MOCK_KEYS.session, { ...session, user });
		writeStorage(
			MOCK_KEYS.users,
			loadUsers().map((u) => (u.id === user.id ? user : u))
		);
		return user;
	}
};

export async function resetMockData(): Promise<void> {
	await delay(150);
	removeStorage(MOCK_KEYS.tasks);
	removeStorage(MOCK_KEYS.lists);
}
