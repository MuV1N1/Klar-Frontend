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
	/** null = inbox (no list assigned). */
	listId: string | null;
	completed: boolean;
	/** ISO timestamp, set when the task was completed. */
	completedAt: string | null;
	/** ISO timestamp. */
	createdAt: string;
	/** ISO timestamp. */
	updatedAt: string;
}

export interface CreateTaskInput {
	title: string;
	description?: string | null;
	dueDate?: string | null;
	dueTime?: string | null;
	priority?: TaskPriority;
	listId?: string | null;
}

export type UpdateTaskInput = Partial<CreateTaskInput> & {
	completed?: boolean;
};
