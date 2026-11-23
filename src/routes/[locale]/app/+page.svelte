<script lang="ts">
	import DashboardSkeleton from '#lib/components/dashboard/DashboardSkeleton.svelte';
	import StatStrip from '#lib/components/dashboard/StatStrip.svelte';
	import ListCard from '#lib/components/lists/ListCard.svelte';
	import QuickAdd from '#lib/components/tasks/QuickAdd.svelte';
	import TaskSection from '#lib/components/tasks/TaskSection.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import EmptyState from '#lib/components/ui/EmptyState.svelte';
	import ErrorState from '#lib/components/ui/ErrorState.svelte';
	import ProgressBar from '#lib/components/ui/ProgressBar.svelte';
	import { localizedHref, useLocale, useTranslations } from '#lib/i18n/index.ts';
	import { lists } from '#lib/stores/lists.svelte.ts';
	import { settings } from '#lib/stores/settings.svelte.ts';
	import { tasks } from '#lib/stores/tasks.svelte.ts';
	import { ui } from '#lib/stores/ui.svelte.ts';
	import Icon from '#lib/components/ui/Icon.svelte';
	import { LIST_COLOR_VALUES } from '#lib/types/index.ts';
	import { isoWeek, todayISO } from '#lib/utils/date.ts';

	const t = useTranslations();
	const locale = useLocale();

	const href = (path: string) => localizedHref(locale(), path);
	const progress = $derived(tasks.todayProgress);
	// The day itself is the title: "Montag · KW 48" over "23. November"
	const now = new Date();
	const weekday = $derived(new Intl.DateTimeFormat(locale(), { weekday: 'long' }).format(now));
	const dayMonth = $derived(
		new Intl.DateTimeFormat(locale(), { day: 'numeric', month: 'long' }).format(now)
	);
	// One tick per task due today; past a dozen a bar reads better than a row of circles
	const MAX_TICKS = 12;
</script>

<svelte:head><title>{t('dashboard.title')} – {t('app.name')}</title></svelte:head>

{#if tasks.status === 'error'}
	<ErrorState
		title={t('common.errorTitle')}
		message={tasks.error?.message ?? t('common.errorGeneric')}
		retryLabel={t('common.retry')}
		onretry={() => void tasks.load(true)}
	/>
{:else if tasks.isLoading || lists.isLoading}
	<DashboardSkeleton />
{:else}
	<!-- Header: the date as title, today's progress as a row of ticks -->
	<header
		class="mb-8 flex animate-fade-in flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"
	>
		<div class="flex flex-col gap-1">
			<p class="text-[13px] text-muted">
				{weekday} · {t('calendar.weekNumber', { week: isoWeek(todayISO()) })}
			</p>
			<h1
				class="font-display text-[36px] leading-[1.05] font-bold tracking-[-0.03em] text-fg sm:text-[48px]"
			>
				{dayMonth}
			</h1>
			<p class="mt-1 text-[15px] text-fg-2">
				{t('dashboard.subtitle', { count: tasks.today.length })}
			</p>
		</div>
		{#if progress.total > 0}
			<div class="flex flex-col gap-2 lg:items-end">
				{#if progress.total <= MAX_TICKS}
					<div class="flex gap-1" role="img" aria-label={t('dashboard.progressValue', progress)}>
						{#each { length: progress.total }, index (index)}
							<span
								class={`flex h-7 w-7 items-center justify-center rounded-full border-2 ${
									index < progress.done ? 'border-accent bg-accent text-accent-fg' : 'border-border'
								}`}
							>
								{#if index < progress.done}<Icon name="check" size={14} strokeWidth={3} />{/if}
							</span>
						{/each}
					</div>
				{:else}
					<ProgressBar
						value={progress.done}
						max={progress.total}
						label={t('dashboard.progress')}
						class="w-[300px] max-w-full"
					/>
				{/if}
				<span class="text-[13px] text-fg-2 tabular-nums"
					>{t('dashboard.progressValue', progress)}</span
				>
			</div>
		{/if}
	</header>

	<div class="flex flex-col gap-10">
		<!-- Stats -->
		<StatStrip
			stats={[
				{
					label: t('dashboard.stats.open'),
					value: tasks.open.length,
					color: LIST_COLOR_VALUES.blue
				},
				{
					label: t('dashboard.stats.today'),
					value: tasks.today.length,
					color: LIST_COLOR_VALUES.orange
				},
				{
					label: t('dashboard.stats.overdue'),
					value: tasks.overdue.length,
					tone: tasks.overdue.length ? 'danger' : 'default',
					color: tasks.overdue.length ? LIST_COLOR_VALUES.pink : LIST_COLOR_VALUES.gray
				},
				{
					label: t('dashboard.stats.completedWeek'),
					value: tasks.completedThisWeek,
					href: href('/app/completed'),
					color: LIST_COLOR_VALUES.lime
				}
			]}
		/>

		<!-- Quick add -->
		<QuickAdd placeholder={t('dashboard.quickAdd')} defaults={{ dueDate: todayISO() }} />

		{#if tasks.overdue.length}
			<TaskSection
				label={t('dashboard.overdueSection')}
				tasks={tasks.overdue}
				count={tasks.overdue.length}
			/>
		{/if}

		<TaskSection
			label={t('dashboard.todaySection')}
			tasks={tasks.today}
			count={tasks.today.length}
			hideDate
			highlightFirst
		>
			{#snippet empty()}
				<EmptyState
					icon="sun"
					title={t('dashboard.emptyToday')}
					description={t('dashboard.emptyTodayHint')}
					compact
				>
					<Button
						variant="primary"
						size="sm"
						icon="plus"
						onclick={() => ui.openNewTask({ dueDate: todayISO() })}
					>
						{t('navigation.newTask')}
					</Button>
				</EmptyState>
			{/snippet}
		</TaskSection>

		{#if settings.value.showCompletedOnDashboard}
			<TaskSection
				label={t('dashboard.recentlyCompleted')}
				tasks={tasks.recentlyCompleted}
				count={tasks.recentlyCompleted.length}
				variant="completed"
			>
				{#snippet action()}
					<a href={href('/app/completed')} class="text-[12px] text-muted hover:text-fg"
						>{t('dashboard.showAll')}</a
					>
				{/snippet}
				{#snippet empty()}
					<p class="px-3 text-[13px] text-muted">{t('dashboard.emptyCompleted')}</p>
				{/snippet}
			</TaskSection>
		{/if}

		<!-- Lists overview -->
		<section class="flex animate-rise-in flex-col gap-4">
			<div class="flex items-center justify-between">
				<h2 class="section-label">{t('dashboard.lists')} · {lists.todo.length}</h2>
				<a href={href('/app/todos')} class="text-[12px] text-muted hover:text-fg"
					>{t('dashboard.allLists')}</a
				>
			</div>
			{#if lists.todo.length === 0}
				<EmptyState
					icon="layers"
					title={t('dashboard.noLists')}
					description={t('lists.emptyHint')}
					compact
				>
					<Button variant="primary" size="sm" icon="plus" onclick={() => ui.openNewList()}
						>{t('navigation.newList')}</Button
					>
				</EmptyState>
			{:else}
				<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
					{#each lists.todo.slice(0, 6) as list (list.id)}
						<ListCard {list} />
					{/each}
				</div>
			{/if}
		</section>
	</div>
{/if}
