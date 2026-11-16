import type { CalendarEvent } from '#lib/types/index.ts';

import { toISODate } from './date.ts';

/** Local date (browser time zone) an instant falls on. */
function localDate(instant: string): string {
	return toISODate(new Date(instant));
}

/** First and last local day an event covers (all-day: its dates; timed: its instants). */
export function eventDays(event: CalendarEvent): { first: string; last: string } {
	if (event.allDay || !event.startsAt || !event.endsAt) {
		return { first: event.startDate, last: event.endDate };
	}
	const first = localDate(event.startsAt);
	// An event ending exactly at midnight does not cover the next day.
	const end = new Date(event.endsAt);
	const last =
		end.getTime() > new Date(event.startsAt).getTime() ? new Date(end.getTime() - 1) : end;
	return { first, last: toISODate(last) };
}

/** Unique key for an occurrence (a series shares its id across occurrences). */
export function occurrenceKey(event: CalendarEvent): string {
	return `${event.id}|${event.occurrenceStart ?? ''}`;
}
