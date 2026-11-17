import { api } from '#lib/api/index.ts';
import { toApiError, type ApiError } from '#lib/api/errors.ts';
import type { Group, GroupInvite } from '#lib/types/index.ts';

import { calendar } from './calendar.svelte.ts';
import { lists } from './lists.svelte.ts';
import { tasks } from './tasks.svelte.ts';
import type { LoadStatus } from './lists.svelte.ts';

class GroupStore {
	#groups = $state<Group[]>([]);
	#status = $state<LoadStatus>('idle');
	#error = $state<ApiError | null>(null);

	get items(): Group[] {
		return this.#groups;
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

	byId(id: string | null | undefined): Group | undefined {
		return id ? this.#groups.find((g) => g.id === id) : undefined;
	}

	async load(force = false) {
		if (this.#status === 'loading') return;
		if (this.#status === 'ready' && !force) return;
		this.#status = 'loading';
		this.#error = null;
		try {
			this.#groups = await api.groups.list();
			this.#status = 'ready';
		} catch (error) {
			this.#error = toApiError(error);
			this.#status = 'error';
		}
	}

	async create(name: string): Promise<Group> {
		try {
			const group = await api.groups.create(name);
			this.#groups = [...this.#groups, group];
			return group;
		} catch (error) {
			throw toApiError(error);
		}
	}

	async rename(id: string, name: string) {
		try {
			this.#replace(await api.groups.rename(id, name));
		} catch (error) {
			throw toApiError(error);
		}
	}

	/** Shared lists and events become private again or disappear, so everything reloads. */
	async remove(id: string) {
		try {
			await api.groups.remove(id);
			await this.#afterAccessChange();
		} catch (error) {
			throw toApiError(error);
		}
	}

	async removeMember(id: string, userId: string) {
		try {
			await api.groups.removeMember(id, userId);
			await this.#afterAccessChange();
		} catch (error) {
			throw toApiError(error);
		}
	}

	async invite(id: string, email?: string): Promise<GroupInvite> {
		try {
			return await api.groups.invite(id, email);
		} catch (error) {
			throw toApiError(error);
		}
	}

	async accept(token: string): Promise<Group> {
		try {
			const group = await api.groups.accept(token);
			await this.#afterAccessChange();
			return group;
		} catch (error) {
			throw toApiError(error);
		}
	}

	reset() {
		this.#groups = [];
		this.#status = 'idle';
		this.#error = null;
	}

	#replace(group: Group) {
		this.#groups = this.#groups.map((g) => (g.id === group.id ? group : g));
	}

	async #afterAccessChange() {
		await Promise.all([this.load(true), lists.load(true), tasks.load(true), calendar.reload()]);
	}
}

export const groups = new GroupStore();
