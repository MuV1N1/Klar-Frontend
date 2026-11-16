import type { Translator } from '#lib/i18n/index.ts';
import { calendar } from '#lib/stores/calendar.svelte.ts';
import type { DragItem } from '#lib/stores/drag.svelte.ts';
import { lists } from '#lib/stores/lists.svelte.ts';
import { tasks } from '#lib/stores/tasks.svelte.ts';
import { toasts } from '#lib/stores/toasts.svelte.ts';
import { ui } from '#lib/stores/ui.svelte.ts';
import type { CalendarEvent, Task } from '#lib/types/index.ts';
import { eventDays } from '#lib/utils/calendar.ts';
import { addDaysISO, parseISODate } from '#lib/utils/date.ts';

/** Moves a task into a list (`null` = inbox). */
export async function moveTaskToList(task: Task, listId: string | null, t: Translator) {
	if (task.listId === listId) return;
	const previous = task.listId;
	try {
		await tasks.update(task.id, { listId });
		const name = listId ? (lists.byId(listId)?.name ?? '') : t('navigation.inbox');
		toasts.success(t('dnd.taskMoved', { title: task.title, target: name }), {
			label: t('dnd.undo'),
			onClick: () => void tasks.update(task.id, { listId: previous })
		});
	} catch {
		toasts.error(t('common.errorGeneric'));
	}
}

/** Sets the due date of a task, keeping its time. */
export async function moveTaskToDay(task: Task, day: string, t: Translator) {
	if (task.dueDate === day) return;
	const previous = task.dueDate;
	try {
		await tasks.update(task.id, { dueDate: day });
		toasts.success(t('dnd.taskRescheduled', { title: task.title }), {
			label: t('dnd.undo'),
			onClick: () => void tasks.update(task.id, { dueDate: previous })
		});
	} catch {
		toasts.error(t('common.errorGeneric'));
	}
}

function daysBetween(from: string, to: string): number {
	return Math.round((parseISODate(to).getTime() - parseISODate(from).getTime()) / 86_400_000);
}

/**
 * Moves an event (occurrence) so it starts on `day`, keeping times and duration.
 * For a series the user picks which occurrences move.
 */
export async function moveEventToDay(event: CalendarEvent, day: string, t: Translator) {
	const delta = daysBetween(eventDays(event).first, day);
	if (delta === 0) return;
	const series = event.recurrence !== null || event.seriesId !== null;
	const scope = series ? await ui.askScope('save') : undefined;
	if (scope === null) return;
	try {
		await calendar.update(
			event.id,
			{
				startDate: addDaysISO(delta, parseISODate(event.startDate)),
				endDate: addDaysISO(delta, parseISODate(event.endDate))
			},
			scope ? { scope, occurrence: event.occurrenceStart } : undefined
		);
		toasts.success(t('dnd.eventMoved', { title: event.title }));
	} catch {
		toasts.error(t('common.errorGeneric'));
	}
}

/** Drop handler for a calendar day: tasks get the date, events move there. */
export function dropOnDay(item: DragItem, day: string, t: Translator) {
	if (item.kind === 'task') void moveTaskToDay(item.task, day, t);
	else void moveEventToDay(item.event, day, t);
}
