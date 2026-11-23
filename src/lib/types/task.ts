import type { Reminder } from './calendar.ts';

export type TaskPriority = 'low' | 'normal' | 'high';

export const TASK_PRIORITIES: readonly TaskPriority[] = ['low', 'normal', 'high'];

export interface Task {
	id: string;
	title: string;
	description: string | null;
	/** ISO date (YYYY-MM-DD) in the user's local calendar, or null. */
	dueDate: string | null;
	/** Optional time of day (HH:mm). */
	dueTime: string | null;
	priority: TaskPriority;
	/** How many to buy (1-200); 1 for regular tasks. */
	quantity: number;
	/** null = inbox (no list assigned). */
	listId: string | null;
	/** User id of the creator (tasks in shared lists can come from any member). */
	createdBy: string;
	/** Group member responsible for the task; only in lists shared with a group. */
	assigneeId: string | null;
	completed: boolean;
	/** ISO timestamp, set when the task was completed. */
	completedAt: string | null;
	/** ISO timestamp. */
	createdAt: string;
	/** ISO timestamp. */
	updatedAt: string;
	/** Only take effect with a due date. */
	reminders: Reminder[];
}

export interface CreateTaskInput {
	title: string;
	description?: string | null;
	dueDate?: string | null;
	dueTime?: string | null;
	priority?: TaskPriority;
	quantity?: number;
	listId?: string | null;
	/** Must be a member of the list's group; null = nobody. */
	assigneeId?: string | null;
	reminders?: Reminder[];
}

export type UpdateTaskInput = Partial<CreateTaskInput> & {
	completed?: boolean;
};
