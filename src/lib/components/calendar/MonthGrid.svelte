<script lang="ts">
	import { useLocale, useTranslations } from '#lib/i18n/index.ts';
	import { calendar, occurrenceKey } from '#lib/stores/calendar.svelte.ts';
	import { settings } from '#lib/stores/settings.svelte.ts';
	import { tasks } from '#lib/stores/tasks.svelte.ts';
	import { LIST_COLOR_VALUES } from '#lib/types/index.ts';
	import { formatInstantTime, monthGridISO, parseISODate, todayISO } from '#lib/utils/date.ts';

	interface Props {
		/** Any day of the shown month; also the selected day. */
		selected: string;
		onselect: (day: string) => void;
		onopen: (day: string) => void;
	}

	let { selected, onselect, onopen }: Props = $props();

	const t = useTranslations();
	const locale = useLocale();

	const days = $derived(monthGridISO(selected, settings.value.weekStart));
	const month = $derived(parseISODate(selected).getMonth());
	const today = todayISO();

	const weekdayNames = $derived(
		days
			.slice(0, 7)
			.map((day) =>
				new Intl.DateTimeFormat(locale(), { weekday: 'short' }).format(parseISODate(day))
			)
	);

	const MAX_ITEMS = 3;

	function itemsFor(day: string) {
		const events = calendar.forDay(day).map((event) => ({
			key: occurrenceKey(event),
			color: LIST_COLOR_VALUES[event.color],
			label: event.title,
			time: event.allDay || !event.startsAt ? null : formatInstantTime(event.startsAt, locale()),
			allDay: event.allDay,
			done: false
		}));
		const due = tasks.items
			.filter((task) => task.dueDate === day)
			.map((task) => ({
				key: `task-${task.id}`,
				color: 'var(--muted)',
				label: task.title,
				time: task.dueTime,
				allDay: false,
				done: task.completed
			}));
		return [...events, ...due.filter((task) => !task.done)];
	}
</script>

<div class="overflow-hidden rounded-[18px] border border-border bg-surface">
	<div class="grid grid-cols-7 border-b border-border">
		{#each weekdayNames as name, i (i)}
			<div class="px-2 py-2 text-center text-[11px] font-medium tracking-wide text-muted uppercase">
				{name}
			</div>
		{/each}
	</div>
	<div class="grid grid-cols-7 grid-rows-6">
		{#each days as day (day)}
			{@const items = itemsFor(day)}
			{@const inMonth = parseISODate(day).getMonth() === month}
			<div
				role="button"
				tabindex="0"
				aria-pressed={day === selected}
				aria-label={new Intl.DateTimeFormat(locale(), { dateStyle: 'full' }).format(
					parseISODate(day)
				)}
				onclick={() => onselect(day)}
				ondblclick={() => onopen(day)}
				onkeydown={(e) => {
					if (e.key === 'Enter' || e.key === ' ') {
						e.preventDefault();
						onselect(day);
					}
				}}
				class={`flex min-h-16 cursor-pointer flex-col gap-1 border-r border-b border-border p-1.5 text-left transition-colors sm:min-h-28 sm:p-2 [&:nth-child(7n)]:border-r-0 [&:nth-last-child(-n+7)]:border-b-0 ${
					day === selected ? 'bg-accent-soft' : 'hover:bg-surface-2'
				} ${inMonth ? '' : 'opacity-45'}`}
			>
				<span
					class={`flex h-6 w-6 items-center justify-center self-center rounded-full text-[12px] font-medium sm:self-start ${
						day === today ? 'bg-accent text-accent-fg' : 'text-fg-2'
					}`}
				>
					{parseISODate(day).getDate()}
				</span>
				<!-- Phones: coloured dots; larger screens: short entries -->
				<span class="flex flex-wrap justify-center gap-0.5 sm:hidden">
					{#each items.slice(0, 4) as item (item.key)}
						<span class="h-1.5 w-1.5 rounded-full" style={`background:${item.color}`}></span>
					{/each}
				</span>
				<span class="hidden flex-col gap-0.5 sm:flex">
					{#each items.slice(0, MAX_ITEMS) as item (item.key)}
						<span
							class={`flex items-center gap-1 truncate rounded-[6px] px-1.5 py-0.5 text-[11px] leading-tight ${
								item.allDay ? 'text-fg' : 'text-fg-2'
							}`}
							style={item.allDay
								? `background:color-mix(in srgb, ${item.color} 22%, transparent)`
								: ''}
						>
							{#if !item.allDay}<span
									class="h-1.5 w-1.5 shrink-0 rounded-full"
									style={`background:${item.color}`}
								></span>{/if}
							{#if item.time}<span class="shrink-0 text-muted">{item.time}</span>{/if}
							<span class="truncate">{item.label}</span>
						</span>
					{/each}
					{#if items.length > MAX_ITEMS}
						<span class="px-1.5 text-[11px] text-muted"
							>{t('calendar.more', { count: items.length - MAX_ITEMS })}</span
						>
					{/if}
				</span>
			</div>
		{/each}
	</div>
</div>
