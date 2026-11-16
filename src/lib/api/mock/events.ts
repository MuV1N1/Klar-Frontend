import type { CalendarEvent, CreateEventInput } from '#lib/types/index.ts';
import { createId } from '#lib/utils/id.ts';
import { addDaysISO, parseISODate } from '#lib/utils/date.ts';
import { expandRrule } from '#lib/utils/recurrence.ts';

import { ApiError } from '../errors.ts';
import type { EventsApi } from '../services/types.ts';
import { readNotificationSettings } from './notifications.ts';
import { MOCK_KEYS, delay, readStorage, writeStorage } from './storage.ts';

/**
 * Mock events backed by localStorage. Simplified compared to the backend: a series is always
 * changed as a whole, and "only this one" / "this and following" deletions just hide occurrences.
 */
interface StoredEvent extends Omit<CalendarEvent, 'seriesId' | 'occurrenceStart' | 'exception'> {
	/** Hidden occurrence dates of a series. */
	cancelled: string[];
}

function load(): StoredEvent[] {
	return readStorage<StoredEvent[]>(MOCK_KEYS.events, () => []);
}

function save(events: StoredEvent[]): void {
	writeStorage(MOCK_KEYS.events, events);
}

function daysBetween(from: string, to: string): number {
	return Math.round((parseISODate(to).getTime() - parseISODate(from).getTime()) / 86_400_000);
}

function instant(date: string, time: string | null): string | null {
	return time ? new Date(`${date}T${time}:00`).toISOString() : null;
}

function occurrence(event: StoredEvent, startDate: string): CalendarEvent {
	const endDate = addDaysISO(daysBetween(event.startDate, event.endDate), parseISODate(startDate));
	const recurring = event.recurrence !== null;
	return {
		...event,
		seriesId: recurring ? event.id : null,
		occurrenceStart: recurring ? `${startDate}T${event.startTime ?? '00:00'}:00` : null,
		exception: false,
		startDate,
		endDate,
		startsAt: instant(startDate, event.startTime),
		endsAt: instant(endDate, event.endTime)
	};
}

function toStored(input: CreateEventInput, base?: StoredEvent): StoredEvent {
	const allDay = input.allDay;
	const startDate = input.startDate;
	const startTime = allDay ? null : (input.startTime ?? null);
	const endTime = allDay ? null : (input.endTime ?? null);
	if (!input.title.trim()) throw new ApiError('Title is required', 'validation', 400);
	if (!allDay && (!startTime || !endTime))
		throw new ApiError('startTime and endTime are required', 'validation', 400);
	if (`${input.endDate}T${endTime ?? ''}` < `${startDate}T${startTime ?? ''}`)
		throw new ApiError('The end must not be before the start', 'validation', 400);
	const settings = readNotificationSettings();
	return {
		id: base?.id ?? createId('event'),
		title: input.title.trim(),
		description: input.description?.trim() || null,
		location: input.location?.trim() || null,
		color: input.color ?? 'blue',
		allDay,
		startDate,
		startTime,
		endDate: input.endDate,
		endTime,
		timeZone: input.timeZone,
		startsAt: null,
		endsAt: null,
		recurrence: input.recurrence || null,
		reminders:
			input.reminders ?? (allDay ? settings.allDayEventReminders : settings.eventReminders),
		cancelled: base?.cancelled ?? []
	};
}

export const mockEventsApi: EventsApi = {
	async list(from, to) {
		await delay();
		const result: CalendarEvent[] = [];
		for (const event of load()) {
			const length = daysBetween(event.startDate, event.endDate);
			const starts = event.recurrence
				? expandRrule(
						event.recurrence,
						event.startDate,
						addDaysISO(-length, parseISODate(from)),
						to
					)
				: [event.startDate];
			for (const start of starts) {
				const occ = occurrence(event, start);
				if (occ.startDate <= to && occ.endDate >= from && !event.cancelled.includes(start)) {
					result.push(occ);
				}
			}
		}
		return result.sort((a, b) =>
			`${a.startDate}${a.startTime ?? ''}`.localeCompare(`${b.startDate}${b.startTime ?? ''}`)
		);
	},

	async get(id) {
		await delay();
		const event = load().find((e) => e.id === id);
		if (!event) throw new ApiError('Event not found', 'not_found', 404);
		return occurrence(event, event.startDate);
	},

	async create(input) {
		await delay();
		const event = toStored(input);
		save([...load(), event]);
		return occurrence(event, event.startDate);
	},

	async update(id, input) {
		await delay();
		const events = load();
		const index = events.findIndex((e) => e.id === id);
		if (index === -1) throw new ApiError('Event not found', 'not_found', 404);
		const current = events[index];
		const updated = toStored(
			{
				...current,
				...input,
				// The dialog sends the occurrence's dates; the mock keeps the series start.
				startDate: current.recurrence ? current.startDate : (input.startDate ?? current.startDate),
				endDate: current.recurrence
					? addDaysISO(
							daysBetween(input.startDate ?? current.startDate, input.endDate ?? current.endDate),
							parseISODate(current.startDate)
						)
					: (input.endDate ?? current.endDate)
			},
			current
		);
		events[index] = updated;
		save(events);
		return occurrence(updated, updated.startDate);
	},

	async remove(id, ref) {
		await delay();
		const events = load();
		const event = events.find((e) => e.id === id);
		if (!event) throw new ApiError('Event not found', 'not_found', 404);
		const date = ref?.occurrence?.slice(0, 10);
		if (event.recurrence && date && ref?.scope === 'this') {
			event.cancelled.push(date);
			save(events);
		} else if (event.recurrence && date && ref?.scope === 'following' && date > event.startDate) {
			event.recurrence = `${event.recurrence.replace(/;(UNTIL|COUNT)=[^;]+/g, '')};UNTIL=${addDaysISO(-1, parseISODate(date)).replaceAll('-', '')}`;
			save(events);
		} else {
			save(events.filter((e) => e.id !== id));
		}
	}
};
