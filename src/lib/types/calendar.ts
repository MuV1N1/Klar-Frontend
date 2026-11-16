import type { ListColor } from './list.ts';

export type ReminderChannel = 'email' | 'push';

export const REMINDER_CHANNELS: readonly ReminderChannel[] = ['push', 'email'];

/**
 * A reminder before an event or a task. `minutesBefore` counts from the start; for all-day
 * events and tasks without a time it counts from 00:00, so negative values fall on the day
 * itself (-540 = 9:00).
 */
export interface Reminder {
	minutesBefore: number;
	channel: ReminderChannel;
}

/** Which occurrences of a series a change or deletion applies to. */
export type EditScope = 'this' | 'following' | 'all';

/** One occurrence of an event, as returned by `GET /events?from&to`. */
export interface CalendarEvent {
	/** Stored row PATCH/DELETE go to (series, exception or single event). */
	id: string;
	/** Set for every occurrence of a series. */
	seriesId: string | null;
	/** Original local start of the occurrence (YYYY-MM-DDTHH:mm:ss), sent back as `?occurrence=`. */
	occurrenceStart: string | null;
	/** This occurrence was changed on its own. */
	exception: boolean;
	title: string;
	description: string | null;
	location: string | null;
	color: ListColor;
	allDay: boolean;
	/** Local date in `timeZone` (YYYY-MM-DD). */
	startDate: string;
	/** HH:mm, null for all-day events. */
	startTime: string | null;
	/** Last day for all-day events (inclusive). */
	endDate: string;
	endTime: string | null;
	/** IANA time zone the times are in. */
	timeZone: string;
	/** ISO instants, only for events with a time. */
	startsAt: string | null;
	endsAt: string | null;
	/** RRULE of the series (without "RRULE:"), null for single events. */
	recurrence: string | null;
	reminders: Reminder[];
}

export interface CreateEventInput {
	title: string;
	description?: string | null;
	location?: string | null;
	color?: ListColor;
	allDay: boolean;
	startDate: string;
	startTime?: string | null;
	endDate: string;
	endTime?: string | null;
	timeZone: string;
	recurrence?: string | null;
	/** Omitted = the defaults from the settings, [] = none. */
	reminders?: Reminder[];
}

export type UpdateEventInput = Partial<CreateEventInput>;

/** Notification preferences stored in the backend (part of `/users/me/settings`). */
export interface NotificationSettings {
	timeZone: string;
	eventReminders: Reminder[];
	allDayEventReminders: Reminder[];
}

export interface PushConfig {
	enabled: boolean;
	publicKey: string | null;
}
