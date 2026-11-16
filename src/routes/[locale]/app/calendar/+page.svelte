<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	import DayAgenda from '#lib/components/calendar/DayAgenda.svelte';
	import MonthGrid from '#lib/components/calendar/MonthGrid.svelte';
	import WeekView from '#lib/components/calendar/WeekView.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import ErrorState from '#lib/components/ui/ErrorState.svelte';
	import IconButton from '#lib/components/ui/IconButton.svelte';
	import PageHeader from '#lib/components/ui/PageHeader.svelte';
	import Skeleton from '#lib/components/ui/Skeleton.svelte';
	import { useLocale, useTranslations } from '#lib/i18n/index.ts';
	import { calendar } from '#lib/stores/calendar.svelte.ts';
	import { settings } from '#lib/stores/settings.svelte.ts';
	import { ui } from '#lib/stores/ui.svelte.ts';
	import {
		addDaysISO,
		addMonthsISO,
		monthGridISO,
		parseISODate,
		todayISO,
		weekDaysISO
	} from '#lib/utils/date.ts';
	import { withQuery } from '#lib/utils/url.ts';

	const t = useTranslations();
	const locale = useLocale();

	type View = 'month' | 'week';

	const isDate = (value: string | null): value is string =>
		!!value && /^\d{4}-\d{2}-\d{2}$/.test(value);

	// The URL keeps the selection, so links from reminders (?date=…) open the right day.
	const selected = $derived(
		isDate(page.url.searchParams.get('date')) ? page.url.searchParams.get('date')! : todayISO()
	);
	const view = $derived<View>(page.url.searchParams.get('view') === 'week' ? 'week' : 'month');

	function navigate(next: { date?: string; view?: View }) {
		const query = withQuery(page.url.search, {
			date: next.date ?? selected,
			view: next.view ?? view
		});
		void goto(query, { replace: true, reset: false });
	}

	const range = $derived.by(() => {
		const days =
			view === 'month'
				? monthGridISO(selected, settings.value.weekStart)
				: weekDaysISO(selected, settings.value.weekStart);
		return { from: days[0], to: days[days.length - 1] };
	});

	$effect(() => {
		void calendar.load(range.from, range.to);
	});

	const heading = $derived.by(() => {
		if (view === 'month') {
			return new Intl.DateTimeFormat(locale(), { month: 'long', year: 'numeric' }).format(
				parseISODate(selected)
			);
		}
		return new Intl.DateTimeFormat(locale(), {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		}).formatRange(parseISODate(range.from), parseISODate(range.to));
	});

	function step(direction: 1 | -1) {
		navigate({
			date:
				view === 'month'
					? addMonthsISO(selected, direction)
					: addDaysISO(7 * direction, parseISODate(selected))
		});
	}
</script>

<svelte:head><title>{t('calendar.title')} – {t('app.name')}</title></svelte:head>

<PageHeader eyebrow={t('calendar.eyebrow')} title={heading}>
	{#snippet actions()}
		<div class="flex items-center gap-1 rounded-[14px] bg-surface-2 p-1" role="group">
			{#each ['month', 'week'] as const as option (option)}
				<button
					type="button"
					aria-pressed={view === option}
					onclick={() => navigate({ view: option })}
					class={`h-8 rounded-[10px] px-3 text-[13px] font-medium transition-colors ${
						view === option ? 'bg-surface text-fg shadow-sm' : 'text-muted hover:text-fg'
					}`}
				>
					{t(`calendar.views.${option}`)}
				</button>
			{/each}
		</div>
		<IconButton icon="chevronLeft" label={t('calendar.previous')} onclick={() => step(-1)} />
		<Button size="sm" variant="outline" onclick={() => navigate({ date: todayISO() })}>
			{t('common.today')}
		</Button>
		<IconButton icon="chevronRight" label={t('calendar.next')} onclick={() => step(1)} />
		<!-- Phones: "New event" sits in the day list below -->
		<span class="hidden sm:inline-flex">
			<Button variant="primary" icon="plus" onclick={() => ui.openNewEvent({ date: selected })}>
				{t('calendar.event.new')}
			</Button>
		</span>
	{/snippet}
</PageHeader>

{#if calendar.status === 'error'}
	<ErrorState
		title={t('common.errorTitle')}
		message={calendar.error?.message ?? t('common.errorGeneric')}
		retryLabel={t('common.retry')}
		onretry={() => void calendar.reload()}
	/>
{:else if calendar.isLoading && calendar.items.length === 0}
	<div class="flex flex-col gap-3" aria-busy="true">
		<Skeleton class="h-[420px] rounded-[18px]" />
	</div>
{:else if view === 'month'}
	<div class="grid animate-rise-in gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
		<MonthGrid
			{selected}
			onselect={(day) => navigate({ date: day })}
			onopen={(day) => ui.openNewEvent({ date: day })}
		/>
		<DayAgenda day={selected} />
	</div>
{:else}
	<div class="animate-rise-in">
		<WeekView {selected} />
	</div>
{/if}
