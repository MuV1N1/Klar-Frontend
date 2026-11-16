import type { Locale, Translator } from '#lib/i18n/index.ts';

import { addDaysISO, parseISODate, toISODate } from './date.ts';

/**
 * Recurrence rules as RRULE strings (RFC 5545, without "RRULE:"), the format the backend and
 * Google Calendar use. Only the subset the editor can build is parsed into a `RecurrenceRule`;
 * anything else is kept as a raw string ("custom").
 */

export type Frequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
export type Weekday = 'MO' | 'TU' | 'WE' | 'TH' | 'FR' | 'SA' | 'SU';

/** Index = Date#getDay() (0 = Sunday). */
export const WEEKDAYS_BY_JS_DAY: readonly Weekday[] = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
export const WEEKDAYS_MONDAY_FIRST: readonly Weekday[] = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];

export type RecurrenceEnd =
	{ type: 'never' } | { type: 'until'; date: string } | { type: 'count'; count: number };

export interface RecurrenceRule {
	freq: Frequency;
	interval: number;
	/** Weekly: the days of the week. */
	byDay: Weekday[];
	/** Monthly: on the same day of the month, or on the n-th weekday (e.g. 2nd Tuesday). */
	monthlyMode: 'day' | 'weekday';
	end: RecurrenceEnd;
}

export function weekdayOf(iso: string): Weekday {
	return WEEKDAYS_BY_JS_DAY[parseISODate(iso).getDay()];
}

/** 1..4 for the n-th weekday in its month, -1 if it is the last one (5th or last week). */
export function weekdayPosition(iso: string): number {
	const date = parseISODate(iso);
	const nth = Math.ceil(date.getDate() / 7);
	const nextWeek = parseISODate(addDaysISO(7, date));
	return nextWeek.getMonth() !== date.getMonth() ? -1 : nth;
}

/** Default rule for a frequency, aligned with the start date. */
export function defaultRule(freq: Frequency, startDate: string): RecurrenceRule {
	return {
		freq,
		interval: 1,
		byDay: [weekdayOf(startDate)],
		monthlyMode: 'day',
		end: { type: 'never' }
	};
}

export function buildRrule(rule: RecurrenceRule, startDate: string): string {
	const parts = [`FREQ=${rule.freq}`];
	if (rule.interval > 1) parts.push(`INTERVAL=${rule.interval}`);
	if (rule.freq === 'WEEKLY') {
		const days = rule.byDay.length > 0 ? rule.byDay : [weekdayOf(startDate)];
		parts.push(`BYDAY=${WEEKDAYS_MONDAY_FIRST.filter((d) => days.includes(d)).join(',')}`);
	}
	if (rule.freq === 'MONTHLY') {
		parts.push(
			rule.monthlyMode === 'weekday'
				? `BYDAY=${weekdayPosition(startDate)}${weekdayOf(startDate)}`
				: `BYMONTHDAY=${parseISODate(startDate).getDate()}`
		);
	}
	if (rule.end.type === 'until') parts.push(`UNTIL=${rule.end.date.replaceAll('-', '')}`);
	if (rule.end.type === 'count') parts.push(`COUNT=${Math.max(1, Math.round(rule.end.count))}`);
	return parts.join(';');
}

function partsOf(rrule: string): Map<string, string> {
	const map = new Map<string, string>();
	for (const part of rrule.replace(/^RRULE:/i, '').split(';')) {
		const [key, value] = part.split('=');
		if (key && value) map.set(key.toUpperCase(), value.toUpperCase());
	}
	return map;
}

/** UNTIL (date or UTC date-time) as a local date. */
function untilDate(value: string): string {
	const y = value.slice(0, 4);
	const m = value.slice(4, 6);
	const d = value.slice(6, 8);
	if (value.length === 8) return `${y}-${m}-${d}`;
	const time = `${value.slice(9, 11)}:${value.slice(11, 13)}:${value.slice(13, 15)}`;
	return toISODate(new Date(`${y}-${m}-${d}T${time}${value.endsWith('Z') ? 'Z' : ''}`));
}

/** Parses a rule the editor can show; null for anything it cannot represent. */
export function parseRrule(rrule: string, startDate: string): RecurrenceRule | null {
	const parts = partsOf(rrule);
	const freq = parts.get('FREQ') as Frequency | undefined;
	if (!freq || !['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'].includes(freq)) return null;
	const known = new Set(['FREQ', 'INTERVAL', 'BYDAY', 'BYMONTHDAY', 'UNTIL', 'COUNT', 'WKST']);
	if ([...parts.keys()].some((key) => !known.has(key))) return null;

	const rule = defaultRule(freq, startDate);
	rule.interval = Number(parts.get('INTERVAL') ?? 1) || 1;

	const byDay = parts.get('BYDAY');
	if (freq === 'WEEKLY' && byDay) {
		const days = byDay.split(',') as Weekday[];
		if (days.some((d) => !WEEKDAYS_MONDAY_FIRST.includes(d))) return null;
		rule.byDay = days;
	} else if (freq === 'MONTHLY') {
		if (byDay) {
			const expected = `${weekdayPosition(startDate)}${weekdayOf(startDate)}`;
			if (byDay !== expected) return null;
			rule.monthlyMode = 'weekday';
		} else if (parts.has('BYMONTHDAY')) {
			if (Number(parts.get('BYMONTHDAY')) !== parseISODate(startDate).getDate()) return null;
		}
	} else if (byDay || parts.has('BYMONTHDAY')) {
		return null;
	}

	const until = parts.get('UNTIL');
	const count = parts.get('COUNT');
	if (until) rule.end = { type: 'until', date: untilDate(until) };
	else if (count) rule.end = { type: 'count', count: Number(count) };
	return rule;
}

/** "Jede Woche am Dienstag und Donnerstag, 10 Mal" / "Every 2 weeks on Tuesday until 30 Nov 2026" */
export function describeRrule(
	rrule: string,
	startDate: string,
	t: Translator,
	locale: Locale
): string {
	const rule = parseRrule(rrule, startDate);
	if (!rule) return t('calendar.recurrence.custom');

	const weekdayName = (day: Weekday) =>
		new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(
			parseISODate(addDaysISO(WEEKDAYS_MONDAY_FIRST.indexOf(day), parseISODate('2026-11-16')))
		);
	const list = (items: string[]) =>
		new Intl.ListFormat(locale, { style: 'long', type: 'conjunction' }).format(items);

	let text = t(`calendar.recurrence.every.${rule.freq}`, { count: rule.interval });
	if (rule.freq === 'WEEKLY') {
		text += ` ${t('calendar.recurrence.onDays', { days: list(rule.byDay.map(weekdayName)) })}`;
	} else if (rule.freq === 'MONTHLY') {
		const start = parseISODate(startDate);
		text +=
			rule.monthlyMode === 'weekday'
				? ` ${t(`calendar.recurrence.onNth.${weekdayPosition(startDate)}`, { day: weekdayName(weekdayOf(startDate)) })}`
				: ` ${t('calendar.recurrence.onMonthDay', { day: start.getDate() })}`;
	} else if (rule.freq === 'YEARLY') {
		const date = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long' }).format(
			parseISODate(startDate)
		);
		text += ` ${t('calendar.recurrence.onDate', { date })}`;
	}
	if (rule.end.type === 'until') {
		const date = new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(
			parseISODate(rule.end.date)
		);
		text += `, ${t('calendar.recurrence.until', { date })}`;
	} else if (rule.end.type === 'count') {
		text += `, ${t('calendar.recurrence.times', { count: rule.end.count })}`;
	}
	return text;
}

/**
 * Start dates of a rule within `[from, to]` (inclusive, YYYY-MM-DD). Only used by the mock API;
 * the real backend expands rules with ical4j. Weeks start on Monday (WKST=MO).
 */
export function expandRrule(rrule: string, startDate: string, from: string, to: string): string[] {
	const rule = parseRrule(rrule, startDate);
	if (!rule) return startDate >= from && startDate <= to ? [startDate] : [];
	const start = parseISODate(startDate);
	const mondayOf = (d: Date) => {
		const copy = new Date(d);
		copy.setDate(copy.getDate() - ((copy.getDay() + 6) % 7));
		return copy;
	};
	const result: string[] = [];
	let matched = 0;
	const limit = rule.end.type === 'until' ? rule.end.date : to;
	for (let iso = startDate; iso <= limit && iso <= to; iso = addDaysISO(1, parseISODate(iso))) {
		const day = parseISODate(iso);
		const days = Math.round((day.getTime() - start.getTime()) / 86_400_000);
		const months =
			(day.getFullYear() - start.getFullYear()) * 12 + day.getMonth() - start.getMonth();
		let matches = false;
		switch (rule.freq) {
			case 'DAILY':
				matches = days % rule.interval === 0;
				break;
			case 'WEEKLY': {
				const weeks = Math.round(
					(mondayOf(day).getTime() - mondayOf(start).getTime()) / (7 * 86_400_000)
				);
				matches = weeks % rule.interval === 0 && rule.byDay.includes(weekdayOf(iso));
				break;
			}
			case 'MONTHLY':
				matches =
					months % rule.interval === 0 &&
					(rule.monthlyMode === 'weekday'
						? weekdayOf(iso) === weekdayOf(startDate) &&
							weekdayPosition(iso) === weekdayPosition(startDate)
						: day.getDate() === start.getDate());
				break;
			case 'YEARLY':
				matches =
					months % (12 * rule.interval) === 0 &&
					day.getMonth() === start.getMonth() &&
					day.getDate() === start.getDate();
				break;
		}
		if (!matches) continue;
		matched++;
		if (iso >= from) result.push(iso);
		if (rule.end.type === 'count' && matched >= rule.end.count) break;
	}
	return result;
}
