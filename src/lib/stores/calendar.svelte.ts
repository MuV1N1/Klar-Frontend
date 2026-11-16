import { api, type OccurrenceRef } from '#lib/api/index.ts';
import { toApiError, type ApiError } from '#lib/api/errors.ts';
import type { CalendarEvent, CreateEventInput, UpdateEventInput } from '#lib/types/index.ts';
import { eventDays } from '#lib/utils/calendar.ts';

import type { LoadStatus } from './lists.svelte.ts';

export { eventDays, occurrenceKey } from '#lib/utils/calendar.ts';

/**
 * Events of the visible range. Changes reload the range, because editing one occurrence of a
 * series can move, split or remove others.
 */
class CalendarStore {
	#events = $state<CalendarEvent[]>([]);
	#status = $state<LoadStatus>('idle');
	#error = $state<ApiError | null>(null);
	#range = $state<{ from: string; to: string } | null>(null);

	get items(): CalendarEvent[] {
		return this.#events;
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

	/** Events covering a local day, all-day events first, then by start time. */
	forDay(iso: string): CalendarEvent[] {
		return this.#events
			.filter((event) => {
				const { first, last } = eventDays(event);
				return first <= iso && iso <= last;
			})
			.sort((a, b) => {
				if (a.allDay !== b.allDay) return a.allDay ? -1 : 1;
				return (a.startsAt ?? '').localeCompare(b.startsAt ?? '');
			});
	}

	/** Loads the days `from`..`to` (inclusive); a repeated call for the same range is a no-op. */
	async load(from: string, to: string, force = false) {
		const same = this.#range?.from === from && this.#range?.to === to;
		if (same && !force && this.#status !== 'error') return;
		this.#range = { from, to };
		if (!same) this.#status = 'loading';
		this.#error = null;
		try {
			const events = await api.events.list(from, to);
			// A newer range may have been requested in the meantime.
			if (this.#range?.from !== from || this.#range?.to !== to) return;
			this.#events = events;
			this.#status = 'ready';
		} catch (error) {
			this.#error = toApiError(error);
			this.#status = 'error';
		}
	}

	async reload() {
		if (this.#range) await this.load(this.#range.from, this.#range.to, true);
	}

	async create(input: CreateEventInput): Promise<CalendarEvent> {
		try {
			const event = await api.events.create(input);
			await this.reload();
			return event;
		} catch (error) {
			throw toApiError(error);
		}
	}

	async update(id: string, input: UpdateEventInput, ref?: OccurrenceRef): Promise<CalendarEvent> {
		try {
			const event = await api.events.update(id, input, ref);
			await this.reload();
			return event;
		} catch (error) {
			throw toApiError(error);
		}
	}

	async remove(id: string, ref?: OccurrenceRef) {
		try {
			await api.events.remove(id, ref);
			await this.reload();
		} catch (error) {
			throw toApiError(error);
		}
	}

	reset() {
		this.#events = [];
		this.#status = 'idle';
		this.#error = null;
		this.#range = null;
	}
}

export const calendar = new CalendarStore();
