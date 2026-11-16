<script lang="ts">
	import { useLocale, useTranslations } from '#lib/i18n/index.ts';
	import { calendar, occurrenceKey } from '#lib/stores/calendar.svelte.ts';
	import { dropTarget } from '#lib/stores/drag.svelte.ts';
	import { tasks } from '#lib/stores/tasks.svelte.ts';
	import { ui } from '#lib/stores/ui.svelte.ts';
	import { formatLongDate, relativeDueKey } from '#lib/utils/date.ts';

	import TaskItem from '../tasks/TaskItem.svelte';
	import Button from '../ui/Button.svelte';
	import EventItem from './EventItem.svelte';
	import { dropOnDay } from './dropActions.ts';

	interface Props {
		day: string;
	}

	let { day }: Props = $props();

	const t = useTranslations();
	const locale = useLocale();

	const events = $derived(calendar.forDay(day));
	const dayTasks = $derived(tasks.items.filter((task) => task.dueDate === day));
	const relative = $derived(relativeDueKey(day));
</script>

<section
	class="-m-2 flex flex-col gap-3 rounded-[20px] p-2 transition-colors data-[drop=over]:bg-accent-soft data-[drop=ready]:bg-surface-2/60"
	aria-label={formatLongDate(day, locale())}
	use:dropTarget={{ accepts: () => true, ondrop: (item) => dropOnDay(item, day, t) }}
>
	<div class="flex items-center justify-between gap-3">
		<h2 class="text-[15px] font-semibold text-fg">
			{#if relative}<span class="text-accent-text">{t(`common.${relative}`)} · </span>{/if}
			{formatLongDate(day, locale())}
		</h2>
		<Button size="sm" variant="ghost" icon="plus" onclick={() => ui.openNewEvent({ date: day })}>
			{t('calendar.event.new')}
		</Button>
	</div>

	{#if events.length === 0 && dayTasks.length === 0}
		<p
			class="rounded-[16px] border border-dashed border-border px-4 py-6 text-center text-[13px] text-muted"
		>
			{t('calendar.emptyDay')}
		</p>
	{:else}
		{#each events as event (occurrenceKey(event))}
			<EventItem {event} {day} />
		{/each}
		{#if dayTasks.length > 0}
			<p class="section-label mt-2 px-1">{t('calendar.tasksDue')}</p>
			<div class="flex flex-col gap-2">
				{#each dayTasks as task (task.id)}
					<TaskItem {task} hideDate />
				{/each}
			</div>
		{/if}
	{/if}
</section>
