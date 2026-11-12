import { SvelteSet } from 'svelte/reactivity';

import { api } from '#lib/api/index.ts';
import { toApiError, type ApiError } from '#lib/api/errors.ts';
import type { CreateTaskInput, Task, UpdateTaskInput } from '#lib/types/index.ts';
import { isPast, isToday, isWithinLastDays, todayISO } from '#lib/utils/date.ts';
import { compareByCompleted, compareByDue } from '#lib/utils/sort.ts';

import type { LoadStatus } from './lists.svelte.ts';

class TaskStore {
	#tasks = $state<Task[]>([]);
	#status = $state<LoadStatus>('idle');
	#error = $state<ApiError | null>(null);
	/** Ids of tasks with a pending write (used to disable controls). */
	#pending = new SvelteSet<string>();

	// --- derived views -------------------------------------------------------
	readonly open = $derived(this.#tasks.filter((t) => !t.completed).sort(compareByDue));
	readonly completed = $derived(this.#tasks.filter((t) => t.completed).sort(compareByCompleted));
	readonly today = $derived(this.open.filter((t) => isToday(t.dueDate)));
	readonly overdue = $derived(this.open.filter((t) => isPast(t.dueDate)));
	readonly upcoming = $derived(
		this.open.filter((t) => t.dueDate !== null && t.dueDate > todayISO())
	);
	readonly inbox = $derived(this.open.filter((t) => t.listId === null));
	readonly recentlyCompleted = $derived(
		this.completed.filter((t) => isWithinLastDays(t.completedAt, 7)).slice(0, 5)
	);
	readonly completedThisWeek = $derived(
		this.completed.filter((t) => isWithinLastDays(t.completedAt, 7)).length
	);
	/** Tasks completed today + tasks due today → progress for the dashboard. */
	readonly todayProgress = $derived.by(() => {
		const doneToday = this.completed.filter(
			(t) => isToday(t.dueDate) || (t.completedAt !== null && isToday(t.completedAt.slice(0, 10)))
		).length;
		const total = doneToday + this.today.length;
		return { done: doneToday, total };
	});

	get items(): Task[] {
		return this.#tasks;
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

	isPending(id: string): boolean {
		return this.#pending.has(id);
	}

	byId(id: string | null | undefined): Task | undefined {
		return id ? this.#tasks.find((t) => t.id === id) : undefined;
	}

	forList(listId: string): { open: Task[]; completed: Task[] } {
		return {
			open: this.open.filter((t) => t.listId === listId),
			completed: this.completed.filter((t) => t.listId === listId)
		};
	}

	openCountForList(listId: string): number {
		return this.open.filter((t) => t.listId === listId).length;
	}

	search(query: string): Task[] {
		const q = query.trim().toLowerCase();
		if (!q) return [];
		return this.#tasks
			.filter(
				(t) => t.title.toLowerCase().includes(q) || (t.description ?? '').toLowerCase().includes(q)
			)
			.slice(0, 20);
	}

	// --- actions -------------------------------------------------------------
	async load(force = false) {
		if (this.#status === 'loading') return;
		if (this.#status === 'ready' && !force) return;
		this.#status = 'loading';
		this.#error = null;
		try {
			this.#tasks = await api.tasks.list();
			this.#status = 'ready';
		} catch (error) {
			this.#error = toApiError(error);
			this.#status = 'error';
		}
	}

	async create(input: CreateTaskInput): Promise<Task> {
		try {
			const task = await api.tasks.create(input);
			this.#tasks = [task, ...this.#tasks];
			return task;
		} catch (error) {
			throw toApiError(error);
		}
	}

	async update(id: string, input: UpdateTaskInput): Promise<Task> {
		this.markPending(id, true);
		try {
			const task = await api.tasks.update(id, input);
			this.#tasks = this.#tasks.map((t) => (t.id === id ? task : t));
			return task;
		} catch (error) {
			throw toApiError(error);
		} finally {
			this.markPending(id, false);
		}
	}

	/** Optimistic complete / reopen. */
	async setCompleted(id: string, completed: boolean): Promise<Task> {
		const previous = this.#tasks;
		const now = new Date().toISOString();
		this.#tasks = this.#tasks.map((t) =>
			t.id === id ? { ...t, completed, completedAt: completed ? now : null } : t
		);
		try {
			const task = await api.tasks.update(id, { completed });
			this.#tasks = this.#tasks.map((t) => (t.id === id ? task : t));
			return task;
		} catch (error) {
			this.#tasks = previous;
			throw toApiError(error);
		}
	}

	async remove(id: string) {
		const previous = this.#tasks;
		this.#tasks = this.#tasks.filter((t) => t.id !== id);
		try {
			await api.tasks.remove(id);
		} catch (error) {
			this.#tasks = previous;
			throw toApiError(error);
		}
	}

	async removeMany(ids: string[]) {
		const previous = this.#tasks;
		const idSet = new Set(ids);
		this.#tasks = this.#tasks.filter((t) => !idSet.has(t.id));
		try {
			await Promise.all(ids.map((id) => api.tasks.remove(id)));
		} catch (error) {
			this.#tasks = previous;
			throw toApiError(error);
		}
	}

	/** Called when a list is deleted so the UI updates without a refetch. */
	detachFromList(listId: string) {
		this.#tasks = this.#tasks.map((t) => (t.listId === listId ? { ...t, listId: null } : t));
	}

	reset() {
		this.#tasks = [];
		this.#status = 'idle';
		this.#error = null;
	}

	private markPending(id: string, pending: boolean) {
		if (pending) this.#pending.add(id);
		else this.#pending.delete(id);
	}
}

export const tasks = new TaskStore();
