import type { Task, TaskList, User } from '#lib/types/index.ts';
import { addDaysISO } from '#lib/utils/date.ts';

/**
 * Demo content shown in mock mode. Dates are relative to "today" so the
 * dashboard always has today's, overdue and upcoming tasks.
 */
export const DEMO_USER: User = {
	id: 'user_demo',
	name: 'Marvin',
	email: 'demo@klar.app',
	createdAt: '2026-01-10T09:00:00.000Z'
};

export const DEMO_CREDENTIALS = { email: 'demo@klar.app', password: 'klar-demo' };

export function seedLists(): TaskList[] {
	const ts = '2026-01-10T09:00:00.000Z';
	return [
		{
			id: 'list_household',
			name: 'Haushalt',
			description: 'Alle Aufgaben rund um Zuhause.',
			color: 'orange',
			icon: 'home',
			createdAt: ts,
			updatedAt: ts
		},
		{
			id: 'list_school',
			name: 'Schule',
			description: 'Lernen, Hausaufgaben, Termine.',
			color: 'blue',
			icon: 'book',
			createdAt: ts,
			updatedAt: ts
		},
		{
			id: 'list_shopping',
			name: 'Einkauf',
			description: 'Was im Kühlschrank fehlt.',
			color: 'purple',
			icon: 'cart',
			createdAt: ts,
			updatedAt: ts
		},
		{
			id: 'list_hobby',
			name: 'Freizeit',
			description: 'Sport, Musik und alles, was Spaß macht.',
			color: 'lime',
			icon: 'music',
			createdAt: ts,
			updatedAt: ts
		}
	];
}

function iso(daysAgo: number, hour = 9): string {
	const d = new Date();
	d.setDate(d.getDate() - daysAgo);
	d.setHours(hour, 0, 0, 0);
	return d.toISOString();
}

export function seedTasks(): Task[] {
	const base = (
		id: string,
		title: string,
		partial: Partial<Task> & { createdDaysAgo?: number }
	): Task => {
		const { createdDaysAgo = 3, ...rest } = partial;
		return {
			id,
			title,
			description: null,
			dueDate: null,
			dueTime: null,
			priority: 'normal',
			listId: null,
			completed: false,
			completedAt: null,
			createdAt: iso(createdDaysAgo),
			updatedAt: iso(createdDaysAgo),
			...rest
		};
	};

	return [
		// Today
		base('task_1', 'Wohnung aufräumen', {
			dueDate: addDaysISO(0),
			dueTime: '10:00',
			listId: 'list_household',
			priority: 'high',
			description: 'Wohnzimmer, Küche und Bad.'
		}),
		base('task_2', 'Mathe lernen', {
			dueDate: addDaysISO(0),
			dueTime: '14:00',
			listId: 'list_school',
			description: 'Kapitel 4: Quadratische Gleichungen.'
		}),
		base('task_3', 'Milch und Eier kaufen', {
			dueDate: addDaysISO(0),
			dueTime: '18:00',
			listId: 'list_shopping'
		}),
		base('task_4', 'Spaziergang machen', { dueDate: addDaysISO(0), priority: 'low' }),
		// Overdue
		base('task_5', 'Müll rausbringen', {
			dueDate: addDaysISO(-1),
			listId: 'list_household',
			createdDaysAgo: 4
		}),
		base('task_6', 'Hausaufgaben Englisch', {
			dueDate: addDaysISO(-2),
			dueTime: '16:00',
			listId: 'list_school',
			priority: 'high',
			createdDaysAgo: 5
		}),
		// Upcoming
		base('task_7', 'Wäsche aufhängen', {
			dueDate: addDaysISO(1),
			dueTime: '09:00',
			listId: 'list_household'
		}),
		base('task_8', 'Englisch Vokabeln wiederholen', {
			dueDate: addDaysISO(2),
			dueTime: '18:00',
			listId: 'list_school'
		}),
		base('task_9', 'Bad putzen', { dueDate: addDaysISO(3), listId: 'list_household' }),
		base('task_10', 'Gitarre üben', {
			dueDate: addDaysISO(4),
			listId: 'list_hobby',
			priority: 'low'
		}),
		base('task_11', 'Sommerurlaub planen', {
			dueDate: addDaysISO(21),
			listId: 'list_hobby',
			description: 'Ziele vergleichen, Budget festlegen.'
		}),
		// Inbox (no list, no date)
		base('task_12', 'Geschenk für Geburtstag besorgen', { createdDaysAgo: 1 }),
		base('task_13', 'Fahrrad zur Inspektion bringen', { createdDaysAgo: 2 }),
		base('task_14', 'Idee für Wochenendtrip', { createdDaysAgo: 0, priority: 'low' }),
		// Completed
		base('task_15', 'Wäsche waschen', {
			listId: 'list_household',
			completed: true,
			completedAt: iso(0, 8),
			dueDate: addDaysISO(0),
			createdDaysAgo: 2
		}),
		base('task_16', 'E-Mails beantworten', {
			completed: true,
			completedAt: iso(0, 7),
			dueDate: addDaysISO(0),
			createdDaysAgo: 1
		}),
		base('task_17', 'Kaffee kaufen', {
			listId: 'list_shopping',
			completed: true,
			completedAt: iso(1, 17),
			createdDaysAgo: 3
		}),
		base('task_18', 'Laufen gehen', {
			listId: 'list_hobby',
			completed: true,
			completedAt: iso(2, 19),
			createdDaysAgo: 6
		})
	];
}
