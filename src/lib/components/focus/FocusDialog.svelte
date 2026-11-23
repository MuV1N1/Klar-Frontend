<script lang="ts">
	import Button from '#lib/components/ui/Button.svelte';
	import Dialog from '#lib/components/ui/Dialog.svelte';
	import Input from '#lib/components/ui/Input.svelte';
	import { useTranslations } from '#lib/i18n/index.ts';
	import { focusTimer, formatCountdown } from '#lib/stores/focus.svelte.ts';
	import { lists } from '#lib/stores/lists.svelte.ts';
	import { FOCUS_MINUTES, settings } from '#lib/stores/settings.svelte.ts';
	import { tasks } from '#lib/stores/tasks.svelte.ts';
	import { toasts } from '#lib/stores/toasts.svelte.ts';
	import { ui } from '#lib/stores/ui.svelte.ts';

	const t = useTranslations();

	// A running sprint wins over what the dialog was opened for, so opening it never stops it.
	const target = $derived(focusTimer.active ? focusTimer.target : ui.focusDialog.target);
	const task = $derived(tasks.byId(target.taskId));
	// Focus on a whole list: its open tasks can be ticked off during the sprint
	const list = $derived(lists.byId(target.listId));
	const listTasks = $derived(list ? tasks.forList(list.id).open : []);

	const status = $derived(focusTimer.status);
	const totalSeconds = $derived(
		status === 'idle' ? settings.value.focusMinutes * 60 : focusTimer.totalSeconds
	);
	const remaining = $derived(status === 'idle' ? totalSeconds : focusTimer.remaining);

	let customMinutes = $state(String(settings.value.focusMinutes));
	function setMinutes(minutes: number) {
		if (!Number.isInteger(minutes) || minutes < 1 || minutes > 180) return;
		customMinutes = String(minutes);
		settings.update({ focusMinutes: minutes });
	}

	function start() {
		focusTimer.start(target, totalSeconds);
	}

	function pause() {
		focusTimer.pause();
	}

	function reset() {
		focusTimer.reset();
	}

	async function complete(id: string, title: string) {
		try {
			await tasks.setCompleted(id, true);
			toasts.success(t('tasks.completed', { title }));
		} catch {
			toasts.error(t('common.errorGeneric'));
		}
	}

	async function completeTask() {
		if (!task) return;
		await complete(task.id, task.title);
		reset();
	}

	const display = $derived(formatCountdown(remaining));

	// Ring: 8 dashed segments like the Figma focus screen. The accent ring shows the
	// remaining fraction; its dash array is computed so the segment pattern is kept.
	const RADIUS = 46;
	const SEGMENTS = 8;
	const circumference = 2 * Math.PI * RADIUS;
	const segmentLength = (circumference / SEGMENTS) * 0.82;
	const gapLength = circumference / SEGMENTS - segmentLength;
	const trackDash = `${segmentLength} ${gapLength}`;
	const remainingFraction = $derived(totalSeconds > 0 ? remaining / totalSeconds : 0);
	const progressDash = $derived.by(() => {
		const visible = remainingFraction * circumference;
		const parts: number[] = [];
		for (let i = 0; i < SEGMENTS; i++) {
			const start = (i * circumference) / SEGMENTS;
			const dash = Math.max(0, Math.min(start + segmentLength, visible) - start);
			parts.push(dash, circumference / SEGMENTS - dash);
		}
		return parts.join(' ');
	});
</script>

<!-- Focus timer as a dialog over the current page, same shell as "new task" -->
<Dialog
	open={ui.focusDialog.open}
	title={t('focus.title')}
	closeLabel={t('common.close')}
	size="sm"
	onclose={() => ui.closeFocus()}
>
	<div class="flex flex-col items-center gap-5 pb-2 text-center">
		<div class="flex flex-col items-center gap-1">
			<h2 class="font-display text-[24px] font-bold tracking-tight text-fg">
				{list?.name ?? task?.title ?? t('focus.noTask')}
			</h2>
			<p class="text-[14px] text-muted">
				{#if status === 'finished'}{t('focus.finishedHint')}
				{:else if list}{t('lists.openTasks', { count: listTasks.length })}
				{:else}{t('focus.subtitle')}{/if}
			</p>
		</div>

		{#if status === 'idle'}
			<div
				class="flex flex-wrap justify-center gap-2"
				role="group"
				aria-label={t('focus.duration')}
			>
				{#each FOCUS_MINUTES as minutes (minutes)}
					<button
						type="button"
						aria-pressed={settings.value.focusMinutes === minutes}
						class={`h-8 rounded-full px-3.5 text-[13px] font-medium tabular-nums transition-colors ${
							settings.value.focusMinutes === minutes
								? 'bg-accent text-accent-fg'
								: 'bg-surface-2 text-fg-2 hover:bg-surface-3 hover:text-fg'
						}`}
						onclick={() => setMinutes(minutes)}>{t('focus.minutes', { count: minutes })}</button
					>
				{/each}
				<label
					class="flex h-8 items-center gap-2 rounded-full bg-surface-2 pr-3 pl-1 text-[13px] text-muted"
				>
					<Input
						type="number"
						min="1"
						max="180"
						inputmode="numeric"
						bind:value={customMinutes}
						onchange={() => setMinutes(Number(customMinutes))}
						class="h-6 w-12 rounded-full !bg-surface px-1 text-center tabular-nums"
						aria-label={t('focus.customMinutes')}
					/>
					{t('focus.minutesShort')}
				</label>
			</div>
		{/if}

		<!-- Timer ring -->
		<div class="relative flex h-[240px] w-[240px] items-center justify-center">
			<svg viewBox="0 0 100 100" class="absolute inset-0 h-full w-full -rotate-90">
				<circle
					cx="50"
					cy="50"
					r={RADIUS}
					fill="none"
					stroke="var(--surface-2)"
					stroke-width="4"
					stroke-dasharray={trackDash}
					stroke-linecap="round"
				/>
				<circle
					cx="50"
					cy="50"
					r={RADIUS}
					fill="none"
					stroke="var(--accent-line)"
					stroke-width="4"
					stroke-linecap="round"
					stroke-dasharray={progressDash}
					class={`transition-[stroke-dasharray,opacity] duration-1000 ease-linear ${status === 'paused' ? 'opacity-50' : ''}`}
				/>
			</svg>
			<span
				class={`font-medium tracking-tight ${status === 'finished' ? 'max-w-[170px] text-center text-2xl leading-tight font-semibold text-accent-text' : 'text-[60px] leading-none text-fg tabular-nums'}`}
			>
				{status === 'finished' ? t('focus.finished') : display}
			</span>
		</div>

		{#if list}
			<ul class="flex w-full flex-col divide-y divide-line text-left">
				{#each listTasks as item (item.id)}
					<li>
						<!-- The whole row ticks the task off, not only the circle -->
						<button
							type="button"
							class="flex w-full items-center gap-3 rounded-[12px] px-3 py-2.5 text-left transition-colors hover:bg-surface-2"
							aria-label={`${t('tasks.markDone')}: ${item.title}`}
							onclick={() => void complete(item.id, item.title)}
						>
							<span
								class="h-5 w-5 shrink-0 rounded-full border-[1.5px] border-border-strong"
								aria-hidden="true"
							></span>
							<span class="min-w-0 flex-1 truncate text-[14px] text-fg">{item.title}</span>
						</button>
					</li>
				{/each}
			</ul>
		{/if}
	</div>

	{#snippet footer()}
		<div class="flex flex-wrap items-center justify-end gap-2">
			{#if status === 'idle'}
				<Button variant="primary" icon="play" onclick={start}>{t('focus.start')}</Button>
			{:else if status === 'running'}
				<Button variant="ghost" onclick={reset}>{t('focus.stop')}</Button>
				<Button variant="primary" icon="pause" onclick={pause}>{t('focus.pause')}</Button>
			{:else if status === 'paused'}
				<Button variant="ghost" onclick={reset}>{t('focus.stop')}</Button>
				<Button variant="primary" icon="play" onclick={start}>{t('focus.resume')}</Button>
			{:else}
				<Button variant="ghost" icon="rotate" onclick={reset}>{t('focus.reset')}</Button>
				{#if task}
					<Button variant="primary" icon="check" onclick={completeTask}
						>{t('focus.markDone')}</Button
					>
				{/if}
			{/if}
		</div>
	{/snippet}
</Dialog>
