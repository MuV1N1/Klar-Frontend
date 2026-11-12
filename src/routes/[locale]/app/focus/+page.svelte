<script lang="ts">
	import { page } from '$app/state';

	import Button from '#lib/components/ui/Button.svelte';
	import Select from '#lib/components/ui/Select.svelte';
	import { useTranslations } from '#lib/i18n/index.ts';
	import { settings } from '#lib/stores/settings.svelte.ts';
	import { tasks } from '#lib/stores/tasks.svelte.ts';
	import { toasts } from '#lib/stores/toasts.svelte.ts';

	const t = useTranslations();

	let taskId = $state(page.url.searchParams.get('task') ?? '');
	const task = $derived(tasks.byId(taskId));

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

	async function completeTask() {
		if (!task) return;
		try {
			await tasks.setCompleted(task.id, true);
			toasts.success(t('tasks.completed', { title: task.title }));
			taskId = '';
			reset();
		} catch {
			toasts.error(t('common.errorGeneric'));
		}
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

	const taskOptions = $derived([
		{ value: '', label: t('focus.noTask') },
		...tasks.open.map((task) => ({ value: task.id, label: task.title }))
	]);
</script>

<svelte:head><title>{t('focus.title')} – {t('app.name')}</title></svelte:head>

<div
	class="mx-auto flex max-w-[720px] animate-rise-in flex-col items-center gap-8 rounded-[24px] border border-border bg-surface px-6 py-12 text-center sm:px-12 sm:py-16"
>
	<p class="section-label">{t('focus.title')}</p>

	{#if status === 'idle'}
		<Select
			bind:value={taskId}
			options={taskOptions}
			class="w-full max-w-sm"
			aria-label={t('focus.chooseTask')}
		/>
	{:else}
		<h1 class="text-[20px] font-semibold text-fg sm:text-[22px]">
			{task?.title ?? t('focus.noTask')}
		</h1>
	{/if}

	<p class="text-[13px] text-muted">
		{status === 'finished' ? t('focus.finishedHint') : t('focus.subtitle')}
	</p>

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
				stroke="var(--accent)"
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
</div>
