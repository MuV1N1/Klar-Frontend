<script lang="ts">
	import { useLocale, useTranslations } from '#lib/i18n/index.ts';
	import { calendar, occurrenceKey } from '#lib/stores/calendar.svelte.ts';
	import { draggable, dropTarget, type DragItem } from '#lib/stores/drag.svelte.ts';
	import { lists } from '#lib/stores/lists.svelte.ts';
	import { settings } from '#lib/stores/settings.svelte.ts';
	import { tasks } from '#lib/stores/tasks.svelte.ts';
	import { ui } from '#lib/stores/ui.svelte.ts';
	import { colorValue } from '#lib/types/index.ts';
	import {
		formatInstantTime,
		formatTime,
		isoWeek,
		monthGridISO,
		parseISODate,
		todayISO
	} from '#lib/utils/date.ts';

	import { dropOnDay } from './dropActions.ts';

	interface Props {
		/** Any day of the shown month; also the selected day. */
		selected: string;
		onselect: (day: string) => void;
		onopen: (day: string) => void;
		/** Opens the week starting at the given day. */
		onweek: (firstDay: string) => void;
	}

	let { selected, onselect, onopen, onweek }: Props = $props();

	const t = useTranslations();
	const locale = useLocale();

	const days = $derived(monthGridISO(selected, settings.value.weekStart));
	/** First day of each of the 6 rows. */
	const weekStarts = $derived(days.filter((_, i) => i % 7 === 0));
	const month = $derived(parseISODate(selected).getMonth());
	const today = todayISO();

	const weekdayNames = $derived(
		days
			.slice(0, 7)
			.map((day) =>
				new Intl.DateTimeFormat(locale(), { weekday: 'short' }).format(parseISODate(day))
			)
	);

	/** Entries per cell: phones 2, tablets 3, wide screens 4; the rest is "+n". */
	const VISIBLE = [
		{ count: 2, item: 'flex', more: 'sm:hidden' },
		{ count: 3, item: 'hidden sm:flex', more: 'hidden sm:block xl:hidden' },
		{ count: 4, item: 'hidden xl:flex', more: 'hidden xl:block' }
	];

	interface Item {
		key: string;
		color: string;
		label: string;
		/** Shown as tooltip; the cell itself shows the name. */
		time: string | null;
		allDay: boolean;
		drag: DragItem;
		open: () => void;
	}

	function itemsFor(day: string): Item[] {
		const events: Item[] = calendar.forDay(day).map((event) => ({
			key: occurrenceKey(event),
			color: colorValue(event.color),
			label: event.title,
			time: event.allDay || !event.startsAt ? null : formatInstantTime(event.startsAt, locale()),
			allDay: event.allDay,
			drag: { kind: 'event', event },
			open: () => ui.openEditEvent(event)
		}));
		const due: Item[] = tasks.open
			.filter((task) => task.dueDate === day)
			.map((task) => ({
				key: `task-${task.id}`,
				color: colorValue(lists.byId(task.listId)?.color ?? 'gray'),
				label: task.title,
				time: task.dueTime ? formatTime(task.dueTime, locale()) : null,
				allDay: false,
				drag: { kind: 'task', task },
				open: () => ui.openEditTask(task)
			}));
		return [...events, ...due];
	}

	function itemClass(index: number): string {
		return VISIBLE.find((v) => index < v.count)?.item ?? 'hidden';
	}
</script>

<div class="overflow-hidden rounded-[18px] border border-border bg-surface">
	<div class="flex border-b border-border">
		<div
			class="w-7 shrink-0 border-r border-border py-2.5 text-center text-[10px] font-medium tracking-wide text-muted uppercase sm:w-9 sm:text-[11px]"
		>
			{t('calendar.weekShort')}
		</div>
		<div class="grid flex-1 grid-cols-7">
			{#each weekdayNames as name, i (i)}
				<div
					class="px-2 py-2.5 text-center text-[11px] font-medium tracking-wide text-muted uppercase"
				>
					{name}
				</div>
			{/each}
		</div>
	</div>
	<div class="flex">
		<!-- ISO week of each row; with Sunday-first weeks the Monday (2nd cell) decides -->
		<div class="grid w-7 shrink-0 grid-rows-6 border-r border-border sm:w-9">
			{#each weekStarts as first (first)}
				{@const week = isoWeek(
					days[days.indexOf(first) + (settings.value.weekStart === 'sunday' ? 1 : 0)]
				)}
				<button
					type="button"
					onclick={() => onweek(first)}
					aria-label={t('calendar.weekLong', { week })}
					title={t('calendar.weekLong', { week })}
					class="flex justify-center border-b border-border pt-2 text-[10.5px] font-medium text-muted tabular-nums transition-colors last:border-b-0 hover:bg-surface-2 hover:text-fg sm:pt-2.5 sm:text-[11.5px]"
				>
					{week}
				</button>
			{/each}
		</div>
		<div class="grid flex-1 grid-cols-7 grid-rows-6">
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
					use:dropTarget={{ accepts: () => true, ondrop: (item) => dropOnDay(item, day, t) }}
					class={`flex min-h-20 min-w-0 cursor-pointer flex-col gap-1 border-r border-b border-border p-1 text-left transition-colors data-[drop=over]:bg-accent-soft data-[drop=over]:ring-2 data-[drop=over]:ring-accent-line data-[drop=over]:ring-inset sm:min-h-28 sm:p-1.5 lg:min-h-32 xl:min-h-36 [&:nth-child(7n)]:border-r-0 [&:nth-last-child(-n+7)]:border-b-0 ${
						day === selected ? 'bg-accent-soft' : 'hover:bg-surface-2'
					} ${inMonth ? '' : 'opacity-45'}`}
				>
					<span
						class={`flex h-6 w-6 shrink-0 items-center justify-center self-center rounded-full text-[12px] font-medium sm:self-start ${
							day === today ? 'bg-accent text-accent-fg' : 'text-fg-2'
						}`}
					>
						{parseISODate(day).getDate()}
					</span>
					<span class="flex min-w-0 flex-col gap-0.5">
						{#each items as item, index (item.key)}
							<button
								type="button"
								use:draggable={item.drag}
								title={item.time ? `${item.time} · ${item.label}` : item.label}
								onclick={(e) => {
									e.stopPropagation();
									item.open();
								}}
								class={`min-w-0 items-center gap-1 rounded-[6px] px-1 py-0.5 text-left text-[10px] leading-tight text-fg transition-[filter] hover:brightness-95 sm:px-1.5 sm:text-[11.5px] ${itemClass(index)}`}
								style={`background:color-mix(in srgb, ${item.color} ${item.allDay ? 32 : 16}%, transparent)`}
							>
								{#if !item.allDay}<span
										class="hidden h-1.5 w-1.5 shrink-0 rounded-full sm:block"
										style={`background:${item.color}`}
									></span>{/if}
								<span class="truncate">{item.label}</span>
							</button>
						{/each}
						{#each VISIBLE as visible (visible.count)}
							{#if items.length > visible.count}
								<span
									class={`px-1 text-[10px] text-muted sm:px-1.5 sm:text-[11px] ${visible.more}`}
								>
									{t('calendar.more', { count: items.length - visible.count })}
								</span>
							{/if}
						{/each}
					</span>
				</div>
			{/each}
		</div>
	</div>
</div>
