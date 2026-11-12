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
	import { auth } from '#lib/stores/auth.svelte.ts';
	import { lists } from '#lib/stores/lists.svelte.ts';
	import { settings } from '#lib/stores/settings.svelte.ts';
	import { tasks } from '#lib/stores/tasks.svelte.ts';
	import { ui } from '#lib/stores/ui.svelte.ts';
	import { formatLongDate, todayISO } from '#lib/utils/date.ts';
	import { greetingPeriod } from '#lib/utils/greeting.ts';

	const t = useTranslations();
	const locale = useLocale();

	const href = (path: string) => localizedHref(locale(), path);
	const firstName = $derived(auth.user?.name.split(' ')[0] ?? '');
	const progress = $derived(tasks.todayProgress);
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
	<!-- Header (Figma "Heute": date eyebrow, title, progress on the right) -->
	<header
		class="mb-8 flex animate-fade-in flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"
	>
		<div class="flex flex-col gap-2">
			<p class="text-[13px] text-muted">{formatLongDate(todayISO(), locale())}</p>
			<h1 class="text-[26px] leading-tight font-semibold tracking-tight text-fg sm:text-[30px]">
				{t(`greeting.${greetingPeriod()}`, { name: firstName })}
			</h1>
			<p class="text-sm text-muted">{t('dashboard.subtitle', { count: tasks.today.length })}</p>
		</div>
		<div class="flex w-full flex-col gap-2.5 lg:w-[300px]">
			<div class="flex items-center justify-between text-[12px]">
				<span class="text-muted">{t('dashboard.progress')}</span>
				<span class="text-fg-2"
					>{t('dashboard.progressValue', { done: progress.done, total: progress.total })}</span
				>
			</div>
			<ProgressBar value={progress.done} max={progress.total} label={t('dashboard.progress')} />
		</div>
	</header>

	<div class="flex flex-col gap-10">
		<!-- Stats -->
		<StatStrip
			stats={[
				{ label: t('dashboard.stats.open'), value: tasks.open.length },
				{ label: t('dashboard.stats.today'), value: tasks.today.length },
				{
					label: t('dashboard.stats.overdue'),
					value: tasks.overdue.length,
					tone: tasks.overdue.length ? 'danger' : 'default'
				},
				{
					label: t('dashboard.stats.completedWeek'),
					value: tasks.completedThisWeek,
					href: href('/app/completed')
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
				<h2 class="section-label">{t('dashboard.lists')} · {lists.items.length}</h2>
				<a href={href('/app/lists')} class="text-[12px] text-muted hover:text-fg"
					>{t('dashboard.allLists')}</a
				>
			</div>
			{#if lists.items.length === 0}
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
					{#each lists.items.slice(0, 6) as list (list.id)}
						<ListCard {list} />
					{/each}
				</div>
			{/if}
		</section>
	</div>
{/if}
