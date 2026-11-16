<script lang="ts">
	import { untrack } from 'svelte';

	import { useLocale, useTranslations } from '#lib/i18n/index.ts';
	import { parseISODate } from '#lib/utils/date.ts';
	import {
		WEEKDAYS_MONDAY_FIRST,
		buildRrule,
		defaultRule,
		describeRrule,
		parseRrule,
		weekdayOf,
		weekdayPosition,
		type Frequency,
		type RecurrenceRule,
		type Weekday
	} from '#lib/utils/recurrence.ts';

	import Input from '../ui/Input.svelte';
	import Select from '../ui/Select.svelte';

	interface Props {
		/** RRULE or null (no repetition). */
		value: string | null;
		startDate: string;
		/** Called when the user changes the rule (not on initialisation). */
		onchange?: () => void;
	}

	let { value = $bindable(null), startDate, onchange }: Props = $props();

	const t = useTranslations();
	const locale = useLocale();

	type Mode = 'none' | Frequency | 'custom';

	// Initialised once; the dialog re-creates this component every time it opens.
	const initial = untrack(() => (value ? parseRrule(value, startDate) : null));
	let mode = $state<Mode>(untrack(() => (!value ? 'none' : initial ? initial.freq : 'custom')));
	let rule = $state<RecurrenceRule>(
		initial ??
			defaultRule(
				'WEEKLY',
				untrack(() => startDate)
			)
	);
	const custom = untrack(() => value);

	function update(next: Partial<RecurrenceRule>) {
		rule = { ...rule, ...next };
		write();
	}

	function write() {
		value = mode === 'none' ? null : mode === 'custom' ? custom : buildRrule(rule, startDate);
		onchange?.();
	}

	// Keep weekly/monthly rules aligned when the start date moves.
	let lastStart = untrack(() => startDate);
	$effect(() => {
		const start = startDate;
		if (start === lastStart) return;
		const previousDay = weekdayOf(lastStart);
		lastStart = start;
		untrack(() => {
			if (mode === 'WEEKLY' && rule.byDay.length === 1 && rule.byDay[0] === previousDay) {
				rule = { ...rule, byDay: [weekdayOf(start)] };
			}
			if (mode !== 'none' && mode !== 'custom') value = buildRrule(rule, start);
		});
	});

	const modeOptions = $derived([
		{ value: 'none', label: t('calendar.recurrence.none') },
		{ value: 'DAILY', label: t('calendar.recurrence.daily') },
		{ value: 'WEEKLY', label: t('calendar.recurrence.weekly') },
		{ value: 'MONTHLY', label: t('calendar.recurrence.monthly') },
		{ value: 'YEARLY', label: t('calendar.recurrence.yearly') },
		...(custom && !initial ? [{ value: 'custom', label: t('calendar.recurrence.custom') }] : [])
	]);

	const unitKey = $derived(mode === 'none' || mode === 'custom' ? 'WEEKLY' : mode);

	const weekdayLabel = (day: Weekday) =>
		new Intl.DateTimeFormat(locale(), { weekday: 'short' }).format(
			parseISODate(`2026-11-${16 + WEEKDAYS_MONDAY_FIRST.indexOf(day)}`)
		);

	const monthlyOptions = $derived([
		{
			value: 'day',
			label: t('calendar.recurrence.onMonthDay', { day: parseISODate(startDate).getDate() })
		},
		{
			value: 'weekday',
			label: t(`calendar.recurrence.onNth.${weekdayPosition(startDate)}`, {
				day: new Intl.DateTimeFormat(locale(), { weekday: 'long' }).format(parseISODate(startDate))
			})
		}
	]);

	const endOptions = $derived([
		{ value: 'never', label: t('calendar.recurrence.endNever') },
		{ value: 'until', label: t('calendar.recurrence.endUntil') },
		{ value: 'count', label: t('calendar.recurrence.endCount') }
	]);

	function setEnd(type: string) {
		if (type === 'until') update({ end: { type: 'until', date: startDate } });
		else if (type === 'count') update({ end: { type: 'count', count: 10 } });
		else update({ end: { type: 'never' } });
	}

	function toggleDay(day: Weekday) {
		const has = rule.byDay.includes(day);
		if (has && rule.byDay.length === 1) return;
		update({ byDay: has ? rule.byDay.filter((d) => d !== day) : [...rule.byDay, day] });
	}
</script>

<div class="flex flex-col gap-3">
	<Select
		id="event-recurrence"
		value={mode}
		options={modeOptions}
		onchange={(e) => {
			mode = e.currentTarget.value as Mode;
			if (mode !== 'none' && mode !== 'custom')
				rule = { ...defaultRule(mode, startDate), end: rule.end };
			write();
		}}
	/>

	{#if mode !== 'none' && mode !== 'custom'}
		<div class="flex flex-col gap-3 rounded-[14px] bg-surface-2 p-3">
			<label class="flex items-center gap-2 text-[13px] text-fg-2">
				{t('calendar.recurrence.everyPrefix')}
				<span class="w-20 shrink-0"
					><Input
						type="number"
						min="1"
						max="99"
						class="bg-surface"
						value={String(rule.interval)}
						oninput={(e) => update({ interval: Math.max(1, Number(e.currentTarget.value) || 1) })}
					/></span
				>
				{t(`calendar.recurrence.unit.${unitKey}`, { count: rule.interval })}
			</label>

			{#if mode === 'WEEKLY'}
				<div class="flex flex-wrap gap-1.5" role="group" aria-label={t('calendar.recurrence.days')}>
					{#each WEEKDAYS_MONDAY_FIRST as day (day)}
						<button
							type="button"
							aria-pressed={rule.byDay.includes(day)}
							onclick={() => toggleDay(day)}
							class={`h-9 min-w-11 rounded-[10px] px-2 text-[12px] font-medium transition-colors ${
								rule.byDay.includes(day)
									? 'bg-accent text-accent-fg'
									: 'bg-surface text-muted hover:text-fg'
							}`}
						>
							{weekdayLabel(day)}
						</button>
					{/each}
				</div>
			{:else if mode === 'MONTHLY'}
				<Select
					size="sm"
					value={rule.monthlyMode}
					options={monthlyOptions}
					onchange={(e) => update({ monthlyMode: e.currentTarget.value as 'day' | 'weekday' })}
				/>
			{/if}

			<div class="flex flex-wrap items-center gap-2">
				<Select
					size="sm"
					class="w-44"
					value={rule.end.type}
					options={endOptions}
					onchange={(e) => setEnd(e.currentTarget.value)}
				/>
				{#if rule.end.type === 'until'}
					<Input
						type="date"
						class="h-9 w-44 bg-surface"
						min={startDate}
						value={rule.end.date}
						aria-label={t('calendar.recurrence.endUntil')}
						onchange={(e) =>
							e.currentTarget.value &&
							update({ end: { type: 'until', date: e.currentTarget.value } })}
					/>
				{:else if rule.end.type === 'count'}
					<Input
						type="number"
						min="1"
						max="999"
						class="h-9 w-24 bg-surface"
						value={String(rule.end.count)}
						aria-label={t('calendar.recurrence.endCount')}
						oninput={(e) =>
							update({
								end: { type: 'count', count: Math.max(1, Number(e.currentTarget.value) || 1) }
							})}
					/>
				{/if}
			</div>
		</div>
	{/if}

	{#if value}
		<p class="text-[12px] text-muted">{describeRrule(value, startDate, t, locale())}</p>
	{/if}
</div>
