import type { TaskList } from '#lib/types/index.ts';
import { createId } from '#lib/utils/id.ts';

import { ApiError } from '../errors.ts';
import type { ListsApi } from '../services/types.ts';
import { seedLists } from './seed.ts';
import { MOCK_KEYS, delay, readStorage, writeStorage } from './storage.ts';
import { detachTasksFromList } from './tasks.ts';

function load(): TaskList[] {
	return readStorage<TaskList[]>(MOCK_KEYS.lists, seedLists);
}

function save(lists: TaskList[]): void {
	writeStorage(MOCK_KEYS.lists, lists);
}

/** Mock implementation backed by localStorage. */
export const mockListsApi: ListsApi = {
	async list() {
		await delay();
		return load();
	},

	async get(id) {
		await delay();
		const list = load().find((l) => l.id === id);
		if (!list) throw new ApiError('List not found', 'not_found', 404);
		return list;
	},

	async create(input) {
		await delay();
		const name = input.name.trim();
		if (!name) throw new ApiError('Name is required', 'validation', 400);

		const now = new Date().toISOString();
		const list: TaskList = {
			id: createId('list'),
			name,
			description: input.description?.trim() || null,
			color: input.color ?? 'lime',
			icon: input.icon ?? 'list',
			createdAt: now,
			updatedAt: now
		};
		save([...load(), list]);
		return list;
	},

	async update(id, input) {
		await delay();
		const lists = load();
		const index = lists.findIndex((l) => l.id === id);
		if (index === -1) throw new ApiError('List not found', 'not_found', 404);

		const current = lists[index];
		const updated: TaskList = {
			...current,
			name: input.name !== undefined ? input.name.trim() || current.name : current.name,
			description:
				input.description !== undefined ? input.description?.trim() || null : current.description,
			color: input.color ?? current.color,
			icon: input.icon ?? current.icon,
			updatedAt: new Date().toISOString()
		};
		lists[index] = updated;
		save(lists);
		return updated;
	},

	async remove(id) {
		await delay();
		const lists = load();
		if (!lists.some((l) => l.id === id)) throw new ApiError('List not found', 'not_found', 404);
		save(lists.filter((l) => l.id !== id));
		detachTasksFromList(id);
	}
};
