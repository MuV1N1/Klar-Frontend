<script lang="ts">
	import { page } from '$app/state';

	import Button from '#lib/components/ui/Button.svelte';
	import Checkbox from '#lib/components/ui/Checkbox.svelte';
	import { useTranslations } from '#lib/i18n/index.ts';
	import { lists } from '#lib/stores/lists.svelte.ts';
	import { FOCUS_MINUTES, settings } from '#lib/stores/settings.svelte.ts';
	import { tasks } from '#lib/stores/tasks.svelte.ts';
	import { toasts } from '#lib/stores/toasts.svelte.ts';

	const t = useTranslations();

	let taskId = $state(page.url.searchParams.get('task') ?? '');
	const task = $derived(tasks.byId(taskId));
	// Focus on a whole list: its open tasks can be ticked off during the sprint
	const list = $derived(lists.byId(page.url.searchParams.get('list')));
	const listTasks = $derived(list ? tasks.forList(list.id).open : []);

	const totalSeconds = $derived(settings.value.focusMinutes * 60);
	let remaining = $state(0);
	let status = $state<'idle' | 'running' | 'paused' | 'finished'>('idle');
	let interval: ReturnType<typeof setInterval> | null = null;

	// Keep the idle timer in sync with the configured sprint length
	$effect(() => {
		if (status === 'idle') remaining = totalSeconds;
	});

	$effect(() => () => stopTicking());

	function stopTicking() {
		if (interval) clearInterval(interval);
		interval = null;
	}

	function start() {
		status = 'running';
		stopTicking();
		interval = setInterval(() => {
			remaining -= 1;
			if (remaining <= 0) {
				remaining = 0;
				stopTicking();
				status = 'finished';
			}
		}, 1000);
	}

	function pause() {
		stopTicking();
		status = 'paused';
	}

	function reset() {
		stopTicking();
		status = 'idle';
		remaining = totalSeconds;
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
		taskId = '';
		reset();
	}

	const display = $derived(
		`${String(Math.floor(remaining / 60)).padStart(2, '0')}:${String(remaining % 60).padStart(2, '0')}`
	);

	// Ring: 8 dashed segments like the Figma focus screen. The lime ring shows the
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

<svelte:head><title>{t('focus.title')} – {t('app.name')}</title></svelte:head>

<div
	class="mx-auto flex max-w-[720px] animate-rise-in flex-col items-center gap-8 rounded-[24px] border border-border bg-surface px-6 py-12 text-center sm:px-12 sm:py-16"
>
	<p class="section-label">{t('focus.title')}</p>

	<h1 class="text-[20px] font-semibold text-fg sm:text-[22px]">
		{list?.name ?? task?.title ?? t('focus.noTask')}
	</h1>

	<p class="text-[13px] text-muted">
		{#if status === 'finished'}{t('focus.finishedHint')}
		{:else if list}{t('lists.openTasks', { count: listTasks.length })}
		{:else}{t('focus.subtitle')}{/if}
	</p>

	{#if status === 'idle'}
		<div class="flex flex-wrap justify-center gap-2" role="group" aria-label={t('focus.duration')}>
			{#each FOCUS_MINUTES as minutes (minutes)}
				<button
					type="button"
					aria-pressed={settings.value.focusMinutes === minutes}
					class={`h-9 rounded-full px-4 text-[13px] font-medium tabular-nums transition-colors ${
						settings.value.focusMinutes === minutes
							? 'bg-accent text-accent-fg'
							: 'bg-surface-2 text-fg-2 hover:bg-surface-3 hover:text-fg'
					}`}
					onclick={() => settings.update({ focusMinutes: minutes })}
					>{t('focus.minutes', { count: minutes })}</button
				>
			{/each}
		</div>
	{/if}

	<!-- Timer ring -->
	<div
		class="relative flex h-[280px] w-[280px] items-center justify-center sm:h-[340px] sm:w-[340px]"
	>
		<svg viewBox="0 0 100 100" class="absolute inset-0 h-full w-full -rotate-90">
			<circle
				cx="50"
				cy="50"
				r={RADIUS}
				fill="none"
				stroke="var(--surface-3)"
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
			/>
		</svg>
		<span
			class={`text-[64px] leading-none font-bold tracking-tight tabular-nums sm:text-[80px] ${status === 'finished' ? 'text-accent-text' : 'text-fg'}`}
		>
			{status === 'finished' ? t('focus.finished') : display}
		</span>
	</div>

	<div class="flex flex-wrap items-center justify-center gap-3">
		{#if status === 'idle'}
			<Button variant="primary" size="lg" icon="play" class="min-w-[180px]" onclick={start}
				>{t('focus.start')}</Button
			>
		{:else if status === 'running'}
			<Button variant="primary" size="lg" icon="pause" class="min-w-[180px]" onclick={pause}
				>{t('focus.pause')}</Button
			>
			<Button variant="secondary" size="lg" class="min-w-[180px]" onclick={reset}
				>{t('focus.stop')}</Button
			>
		{:else if status === 'paused'}
			<Button variant="primary" size="lg" icon="play" class="min-w-[180px]" onclick={start}
				>{t('focus.resume')}</Button
			>
			<Button variant="secondary" size="lg" class="min-w-[180px]" onclick={reset}
				>{t('focus.stop')}</Button
			>
		{:else}
			{#if task}
				<Button
					variant="primary"
					size="lg"
					icon="check"
					class="min-w-[180px]"
					onclick={completeTask}>{t('focus.markDone')}</Button
				>
			{/if}
			<Button variant="secondary" size="lg" icon="rotate" class="min-w-[180px]" onclick={reset}
				>{t('focus.reset')}</Button
			>
		{/if}
	</div>

	{#if list}
		<ul class="flex w-full max-w-md flex-col gap-2 text-left">
			{#each listTasks as item (item.id)}
				<li class="flex items-center gap-3 rounded-[14px] bg-surface-2 px-4 py-3">
					<Checkbox
						checked={false}
						size="sm"
						label={t('tasks.markDone')}
						onchange={() => void complete(item.id, item.title)}
					/>
					<span class="min-w-0 flex-1 truncate text-[14px] text-fg-2">{item.title}</span>
				</li>
			{/each}
		</ul>
	{/if}
</div>
