import type {
	AuthSession,
	CreateListInput,
	CreateTaskInput,
	LoginInput,
	RegisterInput,
	Task,
	TaskList,
	UpdateListInput,
	UpdateProfileInput,
	UpdateTaskInput,
	User
} from '#lib/types/index.ts';

/**
 * Service contracts. Both the REST implementation (services/*.ts) and the
 * mock implementation (mock/*.ts) implement these interfaces, so the UI never
 * knows which one it is talking to.
 */
export interface TasksApi {
	list(): Promise<Task[]>;
	get(id: string): Promise<Task>;
	create(input: CreateTaskInput): Promise<Task>;
	update(id: string, input: UpdateTaskInput): Promise<Task>;
	remove(id: string): Promise<void>;
}

export interface ListsApi {
	list(): Promise<TaskList[]>;
	get(id: string): Promise<TaskList>;
	create(input: CreateListInput): Promise<TaskList>;
	update(id: string, input: UpdateListInput): Promise<TaskList>;
	remove(id: string): Promise<void>;
}

export interface AuthApi {
	login(input: LoginInput): Promise<AuthSession>;
	register(input: RegisterInput): Promise<AuthSession>;
	logout(): Promise<void>;
	forgotPassword(email: string): Promise<void>;
	/** Returns the current user, or null when no valid session exists. */
	me(): Promise<User | null>;
	updateProfile(input: UpdateProfileInput): Promise<User>;
}

export interface Api {
	tasks: TasksApi;
	lists: ListsApi;
	auth: AuthApi;
	/** Only available in mock mode: restores the seed data. */
	resetMockData?: () => Promise<void>;
}
