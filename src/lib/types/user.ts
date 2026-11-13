export interface User {
	id: string;
	name: string;
	email: string;
	/** False until the user confirmed the 6-digit code from the verification email. */
	emailVerified: boolean;
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

/** Result of a registration: the account exists but is not signed in until the email is verified. */
export interface RegisterResult {
	user: User;
	verificationRequired: boolean;
}

export interface VerifyEmailInput {
	email: string;
	/** 6-digit code from the email; spaces are ignored by the backend. */
	code: string;
}

export interface ResetPasswordInput {
	email: string;
	code: string;
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
