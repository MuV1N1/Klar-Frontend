import { api } from '#lib/api/index.ts';
import { toApiError, type ApiError } from '#lib/api/errors.ts';
import type { CreateListInput, TaskList, UpdateListInput } from '#lib/types/index.ts';

export type LoadStatus = 'idle' | 'loading' | 'ready' | 'error';

class ListStore {
	#lists = $state<TaskList[]>([]);
	#status = $state<LoadStatus>('idle');
	#error = $state<ApiError | null>(null);

	get items(): TaskList[] {
		return this.#lists;
	}

	get status(): LoadStatus {
		return this.#status;
	}

	get error(): ApiError | null {
		return this.#error;
	}

	get isLoading(): boolean {
		return this.#status === 'idle' || this.#status === 'loading';
	}

	byId(id: string | null | undefined): TaskList | undefined {
		return id ? this.#lists.find((l) => l.id === id) : undefined;
	}

	async load(force = false) {
		if (this.#status === 'loading') return;
		if (this.#status === 'ready' && !force) return;
		this.#status = 'loading';
		this.#error = null;
		try {
			this.#lists = await api.lists.list();
			this.#status = 'ready';
		} catch (error) {
			this.#error = toApiError(error);
			this.#status = 'error';
		}
	}

	async create(input: CreateListInput): Promise<TaskList> {
		try {
			const list = await api.lists.create(input);
			this.#lists = [...this.#lists, list];
			return list;
		} catch (error) {
			throw toApiError(error);
		}
	}

	async update(id: string, input: UpdateListInput): Promise<TaskList> {
		try {
			const list = await api.lists.update(id, input);
			this.#lists = this.#lists.map((l) => (l.id === id ? list : l));
			return list;
		} catch (error) {
			throw toApiError(error);
		}
	}

	async remove(id: string) {
		const previous = this.#lists;
		this.#lists = this.#lists.filter((l) => l.id !== id);
		try {
			await api.lists.remove(id);
		} catch (error) {
			this.#lists = previous;
			throw toApiError(error);
		}
	}

	reset() {
		this.#lists = [];
		this.#status = 'idle';
		this.#error = null;
	}
}

export const lists = new ListStore();
