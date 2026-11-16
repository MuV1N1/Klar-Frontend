<script lang="ts">
	import { useLocale, useTranslations } from '#lib/i18n/index.ts';
	import { eventDays } from '#lib/stores/calendar.svelte.ts';
	import { ui } from '#lib/stores/ui.svelte.ts';
	import { LIST_COLOR_VALUES, type CalendarEvent } from '#lib/types/index.ts';
	import { formatInstantTime } from '#lib/utils/date.ts';

	import Icon from '../ui/Icon.svelte';

	interface Props {
		event: CalendarEvent;
		/** The day the row is shown on (multi-day events show "until …" / "from …"). */
		day: string;
	}

	let { event, day }: Props = $props();

	const t = useTranslations();
	const locale = useLocale();

	const time = $derived.by(() => {
		if (event.allDay || !event.startsAt || !event.endsAt) return t('calendar.allDay');
		const { first, last } = eventDays(event);
		const start = formatInstantTime(event.startsAt, locale());
		const end = formatInstantTime(event.endsAt, locale());
		if (first === day && last === day)
			return event.startsAt === event.endsAt ? start : `${start} – ${end}`;
		if (first === day) return t('calendar.from', { time: start });
		if (last === day) return t('calendar.until', { time: end });
		return t('calendar.allDay');
	});
</script>

<button
	type="button"
	onclick={() => ui.openEditEvent(event)}
	class="flex w-full items-start gap-3 rounded-[16px] border border-border bg-surface px-4 py-3 text-left transition-colors hover:border-border-strong hover:bg-surface-2"
>
	<span
		class="mt-1 h-8 w-1 shrink-0 rounded-full"
		style={`background:${LIST_COLOR_VALUES[event.color]}`}
		aria-hidden="true"
	></span>
	<span class="flex min-w-0 flex-1 flex-col gap-0.5">
		<span class="truncate text-sm font-medium text-fg">{event.title}</span>
		<span class="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[12px] text-muted">
			<span class="flex items-center gap-1"><Icon name="clock" size={12} />{time}</span>
			{#if event.location}
				<span class="flex min-w-0 items-center gap-1"
					><Icon name="mapPin" size={12} /><span class="truncate">{event.location}</span></span
				>
			{/if}
			{#if event.recurrence}
				<span class="flex items-center gap-1" title={t('calendar.recurring')}
					><Icon name="repeat" size={12} /></span
				>
			{/if}
			{#if event.reminders.length > 0}
				<span class="flex items-center gap-1" title={t('calendar.event.reminders')}
					><Icon name="bell" size={12} /></span
				>
			{/if}
		</span>
	</span>
</button>
