import type { Locale, Translator } from '#lib/i18n/index.ts';
import type { Reminder } from '#lib/types/index.ts';

import { formatTime } from './date.ts';

/** Choices for events with a time (minutes before the start). */
export const TIMED_PRESETS: readonly number[] = [0, 5, 10, 15, 30, 60, 120, 1440, 2880, 10080];

/**
 * Choices for all-day events and tasks without a time. They count from 00:00 of the day, so
 * -540 is "on the day at 9:00" and 900 is "the day before at 9:00".
 */
export const ALL_DAY_PRESETS: readonly number[] = [-540, -420, -720, 360, 900, 2340, 9540];

export const MAX_REMINDERS = 10;

/** "15 Minuten vorher", "Zum Beginn", "1 Tag vorher um 09:00", "Am Tag um 09:00" */
export function describeReminder(
	minutesBefore: number,
	allDay: boolean,
	t: Translator,
	locale: Locale
): string {
	if (allDay) {
		const daysBefore = Math.ceil(minutesBefore / 1440);
		const minuteOfDay = daysBefore * 1440 - minutesBefore;
		const time = formatTime(
			`${String(Math.floor(minuteOfDay / 60)).padStart(2, '0')}:${String(minuteOfDay % 60).padStart(2, '0')}`,
			locale
		);
		return daysBefore <= 0
			? t('reminders.onDayAt', { time })
			: t('reminders.daysBeforeAt', { count: daysBefore, time });
	}
	if (minutesBefore === 0) return t('reminders.atStart');
	if (minutesBefore % 10080 === 0)
		return t('reminders.weeksBefore', { count: minutesBefore / 10080 });
	if (minutesBefore % 1440 === 0) return t('reminders.daysBefore', { count: minutesBefore / 1440 });
	if (minutesBefore % 60 === 0) return t('reminders.hoursBefore', { count: minutesBefore / 60 });
	return t('reminders.minutesBefore', { count: minutesBefore });
}

/** Sorted like the backend: earliest reminder first. */
export function sortReminders(reminders: Reminder[]): Reminder[] {
	return [...reminders].sort((a, b) => b.minutesBefore - a.minutesBefore);
}

/** Keeps the first of reminders with the same time and channel. */
export function dedupeReminders(reminders: Reminder[]): Reminder[] {
	const seen = new Set<string>();
	return reminders.filter((r) => {
		const key = `${r.minutesBefore}:${r.channel}`;
		if (seen.has(key)) return false;
		seen.add(key);
		return true;
	});
}
