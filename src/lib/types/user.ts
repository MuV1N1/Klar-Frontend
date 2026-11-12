export interface User {
	id: string;
	name: string;
	email: string;
	/** ISO timestamp. */
	createdAt: string;
}

export interface LoginInput {
	email: string;
	password: string;
}

export interface RegisterInput {
	name: string;
	email: string;
	password: string;
}

export interface UpdateProfileInput {
	name?: string;
	email?: string;
}

export interface AuthSession {
	user: User;
	/** Bearer token issued by the backend (mock: a fake token). */
	accessToken: string;
}
