import type { Task, TaskPriority } from '#lib/types/index.ts';

const PRIORITY_RANK: Record<TaskPriority, number> = { high: 0, normal: 1, low: 2 };

/** Sorts open tasks: due date (nulls last) → time → priority → created. */
export function compareByDue(a: Task, b: Task): number {
	if (a.dueDate !== b.dueDate) {
		if (a.dueDate === null) return 1;
		if (b.dueDate === null) return -1;
		return a.dueDate < b.dueDate ? -1 : 1;
	}
	if (a.dueTime !== b.dueTime) {
		if (a.dueTime === null) return 1;
		if (b.dueTime === null) return -1;
		return a.dueTime < b.dueTime ? -1 : 1;
	}
	return compareByPriority(a, b);
}

export function compareByPriority(a: Task, b: Task): number {
	const diff = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
	return diff !== 0 ? diff : compareByCreated(a, b);
}

export function compareByCreated(a: Task, b: Task): number {
	return a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0;
}

export function compareByCompleted(a: Task, b: Task): number {
	const ac = a.completedAt ?? '';
	const bc = b.completedAt ?? '';
	return ac < bc ? 1 : ac > bc ? -1 : 0;
}
