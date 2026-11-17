import { browser } from '$app/env';

import { syncLiveTimer } from '#lib/native/liveTimer.ts';

export type FocusStatus = 'idle' | 'running' | 'paused' | 'finished';

/** What the sprint is about: one task, a whole list, or nothing (free focus). */
export interface FocusTarget {
	taskId: string | null;
	listId: string | null;
}

interface Saved extends FocusTarget {
	status: FocusStatus;
	totalSeconds: number;
	remaining: number;
	endsAt: number | null;
}

const STORAGE_KEY = 'klar.focus';

/**
 * The focus timer lives outside the focus page, so it keeps running while the user navigates
 * (and across reloads). It counts against an end timestamp, so a throttled background tab
 * does not fall behind.
 */
class FocusTimer {
	status = $state<FocusStatus>('idle');
	totalSeconds = $state(0);
	remaining = $state(0);
	target = $state<FocusTarget>({ taskId: null, listId: null });
	#endsAt: number | null = null;
	#interval: ReturnType<typeof setInterval> | null = null;

	constructor() {
		if (!browser) return;
		try {
			const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') as Saved | null;
			if (!saved) return;
			this.status = saved.status;
			this.totalSeconds = saved.totalSeconds;
			this.remaining = saved.remaining;
			this.target = { taskId: saved.taskId, listId: saved.listId };
			this.#endsAt = saved.endsAt;
			if (this.status === 'running') this.#tick();
		} catch {
			/* ignore storage errors */
		}
	}

	get active(): boolean {
		return this.status !== 'idle';
	}

	/** Starts a new sprint, or resumes a paused one. */
	start(target: FocusTarget, seconds: number) {
		if (this.status !== 'paused') {
			this.target = target;
			this.totalSeconds = seconds;
			this.remaining = seconds;
		}
		this.#endsAt = Date.now() + this.remaining * 1000;
		this.status = 'running';
		this.#tick();
	}

	pause() {
		this.#stop();
		this.#update();
		this.status = 'paused';
		this.#save();
	}

	reset() {
		this.#stop();
		this.status = 'idle';
		this.#endsAt = null;
		this.target = { taskId: null, listId: null };
		this.#save();
	}

	#tick() {
		this.#stop();
		this.#update();
		if (this.status === 'running') this.#interval = setInterval(() => this.#update(), 1000);
		this.#save();
	}

	#update() {
		if (this.#endsAt === null) return;
		this.remaining = Math.max(0, Math.ceil((this.#endsAt - Date.now()) / 1000));
		if (this.remaining === 0 && this.status === 'running') {
			this.#stop();
			this.status = 'finished';
			this.#save();
		}
	}

	#stop() {
		if (this.#interval) clearInterval(this.#interval);
		this.#interval = null;
	}

	#save() {
		if (!browser) return;
		syncLiveTimer(this.status, this.#endsAt, this.remaining, this.totalSeconds, this.target);
		try {
			const saved: Saved = {
				status: this.status,
				totalSeconds: this.totalSeconds,
				remaining: this.remaining,
				endsAt: this.#endsAt,
				...this.target
			};
			localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
		} catch {
			/* ignore storage errors */
		}
	}
}

export const focusTimer = new FocusTimer();

/** "07:30" */
export function formatCountdown(seconds: number): string {
	return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

/** Link back to the focus page of a running sprint. */
export function focusPath(target: FocusTarget): string {
	if (target.listId) return `/app/focus?list=${encodeURIComponent(target.listId)}`;
	if (target.taskId) return `/app/focus?task=${encodeURIComponent(target.taskId)}`;
	return '/app/focus';
}
