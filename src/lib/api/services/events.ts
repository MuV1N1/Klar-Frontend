import type { CalendarEvent, CreateEventInput, UpdateEventInput } from '#lib/types/index.ts';

import { endpoints } from '../config.ts';
import { http } from '../http.ts';
import type { EventsApi, OccurrenceRef } from './types.ts';

function withRef(path: string, ref?: OccurrenceRef): string {
	if (!ref) return path;
	const params = new URLSearchParams({ scope: ref.scope });
	if (ref.occurrence) params.set('occurrence', ref.occurrence);
	return `${path}?${params}`;
}

/** REST implementation – talks to the Spring Boot backend. */
export const eventsApi: EventsApi = {
	list: (from, to) =>
		http.get<CalendarEvent[]>(
			`${endpoints.events.collection}?${new URLSearchParams({ from, to })}`
		),
	get: (id) => http.get<CalendarEvent>(endpoints.events.item(id)),
	create: (input: CreateEventInput) => http.post<CalendarEvent>(endpoints.events.collection, input),
	update: (id, input: UpdateEventInput, ref) =>
		http.patch<CalendarEvent>(withRef(endpoints.events.item(id), ref), input),
	remove: (id, ref) => http.delete<void>(withRef(endpoints.events.item(id), ref))
};
