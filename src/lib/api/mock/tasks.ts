import type { Task } from '#lib/types/index.ts';
import { createId } from '#lib/utils/id.ts';

import { ApiError } from '../errors.ts';
import type { TasksApi } from '../services/types.ts';
import { seedTasks } from './seed.ts';
import { MOCK_KEYS, delay, readStorage, writeStorage } from './storage.ts';

function load(): Task[] {
	return readStorage<Task[]>(MOCK_KEYS.tasks, seedTasks);
}

function save(tasks: Task[]): void {
	writeStorage(MOCK_KEYS.tasks, tasks);
}

/** Mock implementation backed by localStorage. */
export const mockTasksApi: TasksApi = {
	async list() {
		await delay();
		return load();
	},

	async get(id) {
		await delay();
		const task = load().find((t) => t.id === id);
		if (!task) throw new ApiError('Task not found', 'not_found', 404);
		return task;
	},

	async create(input) {
		await delay();
		const title = input.title.trim();
		if (!title) throw new ApiError('Title is required', 'validation', 400);

		const now = new Date().toISOString();
		const task: Task = {
			id: createId('task'),
			title,
			description: input.description?.trim() || null,
			dueDate: input.dueDate || null,
			dueTime: input.dueTime || null,
			priority: input.priority ?? 'normal',
			listId: input.listId ?? null,
			completed: false,
			completedAt: null,
			createdAt: now,
			updatedAt: now
		};
		save([task, ...load()]);
		return task;
	},

	async update(id, input) {
		await delay();
		const tasks = load();
		const index = tasks.findIndex((t) => t.id === id);
		if (index === -1) throw new ApiError('Task not found', 'not_found', 404);

		const current = tasks[index];
		const now = new Date().toISOString();
		const completed = input.completed ?? current.completed;

		const updated: Task = {
			...current,
			title: input.title !== undefined ? input.title.trim() || current.title : current.title,
			description:
				input.description !== undefined ? input.description?.trim() || null : current.description,
			dueDate: input.dueDate !== undefined ? input.dueDate || null : current.dueDate,
			dueTime: input.dueTime !== undefined ? input.dueTime || null : current.dueTime,
			priority: input.priority ?? current.priority,
			listId: input.listId !== undefined ? input.listId : current.listId,
			completed,
			completedAt: completed ? (current.completed ? current.completedAt : now) : null,
			updatedAt: now
		};
		tasks[index] = updated;
		save(tasks);
		return updated;
	},

	async remove(id) {
		await delay();
		const tasks = load();
		if (!tasks.some((t) => t.id === id)) throw new ApiError('Task not found', 'not_found', 404);
		save(tasks.filter((t) => t.id !== id));
	}
};

/** Used when a list is deleted: moves its tasks to the inbox. */
export function detachTasksFromList(listId: string): void {
	const now = new Date().toISOString();
	save(load().map((t) => (t.listId === listId ? { ...t, listId: null, updatedAt: now } : t)));
}
