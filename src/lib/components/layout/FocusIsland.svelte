<script lang="ts">
	import { page } from '$app/state';

	import { localizedHref, useLocale, useTranslations } from '#lib/i18n/index.ts';
	import { focusPath, focusTimer, formatCountdown } from '#lib/stores/focus.svelte.ts';
	import { lists } from '#lib/stores/lists.svelte.ts';
	import { tasks } from '#lib/stores/tasks.svelte.ts';

	import Icon from '../ui/Icon.svelte';

	const t = useTranslations();
	const locale = useLocale();

	const onFocusPage = $derived(/\/app\/focus$/.test(page.url.pathname));
	const title = $derived(
		lists.byId(focusTimer.target.listId)?.name ??
			tasks.byId(focusTimer.target.taskId)?.title ??
			t('focus.noTask')
	);
</script>

<!-- Small pill at the top while a sprint runs elsewhere in the app (like iOS' Dynamic Island) -->
{#if focusTimer.active && !onFocusPage}
	<a
		href={localizedHref(locale(), focusPath(focusTimer.target))}
		aria-label={t('focus.title')}
		class="fixed top-2 left-1/2 z-30 flex h-10 max-w-[min(90vw,360px)] -translate-x-1/2 animate-fade-in items-center gap-2.5 rounded-full bg-fg py-1 pr-4 pl-1.5 text-bg shadow-lg transition-transform hover:scale-[1.03] md:top-4"
	>
		<span
			class={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-accent-fg ${focusTimer.status === 'running' ? 'animate-pulse' : ''}`}
		>
			<Icon name={focusTimer.status === 'paused' ? 'pause' : 'clock'} size={14} />
		</span>
		<span class="text-[14px] font-semibold tabular-nums">
			{focusTimer.status === 'finished'
				? t('focus.finished')
				: formatCountdown(focusTimer.remaining)}
		</span>
		<span class="min-w-0 truncate text-[12px] opacity-70">{title}</span>
	</a>
{/if}
