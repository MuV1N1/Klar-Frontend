import type { Locale } from '#lib/i18n/index.ts';

const DAY_MS = 24 * 60 * 60 * 1000;

/** Local calendar date as ISO string (YYYY-MM-DD). */
export function toISODate(date: Date): string {
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, '0');
	const d = String(date.getDate()).padStart(2, '0');
	return `${y}-${m}-${d}`;
}

export function todayISO(): string {
	return toISODate(new Date());
}

export function addDaysISO(days: number, from: Date = new Date()): string {
	const copy = new Date(from);
	copy.setDate(copy.getDate() + days);
	return toISODate(copy);
}

/** Parses an ISO date (YYYY-MM-DD) as a local Date at midnight. */
export function parseISODate(iso: string): Date {
	const [y, m, d] = iso.split('-').map(Number);
	return new Date(y, (m ?? 1) - 1, d ?? 1);
}

/** Whole days between today and the given ISO date (negative = past). */
export function daysFromToday(iso: string): number {
	const today = parseISODate(todayISO()).getTime();
	const target = parseISODate(iso).getTime();
	return Math.round((target - today) / DAY_MS);
}

export function isToday(iso: string | null): boolean {
	return iso !== null && iso === todayISO();
}

export function isPast(iso: string | null): boolean {
	return iso !== null && iso < todayISO();
}

export function isWithinLastDays(timestamp: string | null, days: number): boolean {
	if (!timestamp) return false;
	return Date.now() - new Date(timestamp).getTime() <= days * DAY_MS;
}

/** "Sonntag, 1. November" / "Sunday, November 1" */
export function formatLongDate(iso: string, locale: Locale): string {
	return new Intl.DateTimeFormat(locale, {
		weekday: 'long',
		day: 'numeric',
		month: 'long'
	}).format(parseISODate(iso));
}

/** "1. Nov." / "Nov 1" */
export function formatShortDate(iso: string, locale: Locale): string {
	return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' }).format(
		parseISODate(iso)
	);
}

/** "12.11.2026, 14:03" */
export function formatDateTime(timestamp: string, locale: Locale): string {
	return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(
		new Date(timestamp)
	);
}

export function formatTime(time: string, locale: Locale): string {
	const [h, m] = time.split(':').map(Number);
	const date = new Date();
	date.setHours(h ?? 0, m ?? 0, 0, 0);
	return new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(date);
}

/**
 * Human-friendly relative label for a due date: today / tomorrow / yesterday,
 * otherwise a short date. Returns a translation key for the relative cases.
 */
export function relativeDueKey(iso: string): 'today' | 'tomorrow' | 'yesterday' | null {
	const diff = daysFromToday(iso);
	if (diff === 0) return 'today';
	if (diff === 1) return 'tomorrow';
	if (diff === -1) return 'yesterday';
	return null;
}
