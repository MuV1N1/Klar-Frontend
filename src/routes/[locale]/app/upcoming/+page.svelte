<script lang="ts">
	import TaskSection from '#lib/components/tasks/TaskSection.svelte';
	import EmptyState from '#lib/components/ui/EmptyState.svelte';
	import ErrorState from '#lib/components/ui/ErrorState.svelte';
	import PageHeader from '#lib/components/ui/PageHeader.svelte';
	import Select from '#lib/components/ui/Select.svelte';
	import Skeleton from '#lib/components/ui/Skeleton.svelte';
	import { useLocale, useTranslations } from '#lib/i18n/index.ts';
	import { lists } from '#lib/stores/lists.svelte.ts';
	import { tasks } from '#lib/stores/tasks.svelte.ts';
	import type { Task } from '#lib/types/index.ts';
	import { daysFromToday, formatLongDate } from '#lib/utils/date.ts';
	import { compareByCreated, compareByDue, compareByPriority } from '#lib/utils/sort.ts';

	const t = useTranslations();
	const locale = useLocale();

	type SortKey = 'due' | 'priority' | 'created';

	let listFilter = $state('');
	let sort = $state<SortKey>('due');

	const comparators = { due: compareByDue, priority: compareByPriority, created: compareByCreated };

	/** Upcoming = due after today; "no date" tasks are shown as a trailing group. */
	const filtered = $derived(
		[
			...tasks.upcoming,
			...tasks.open.filter((task) => task.dueDate === null && task.listId !== null)
		]
			.filter((task) => !listFilter || task.listId === listFilter)
			.sort(comparators[sort])
	);

	interface Group {
		key: string;
		label: string;
		tasks: Task[];
	}

	const groups = $derived.by<Group[]>(() => {
		if (sort !== 'due') return [{ key: 'all', label: t('common.all'), tasks: filtered }];

		const result: Group[] = [];
		for (const task of filtered) {
			let key: string;
			let label: string;
			if (task.dueDate === null) {
				key = 'none';
				label = t('upcoming.noDate');
			} else if (daysFromToday(task.dueDate) > 14) {
				key = 'later';
				label = t('upcoming.later');
			} else {
				key = task.dueDate;
				const prefix = daysFromToday(task.dueDate) === 1 ? `${t('common.tomorrow')} · ` : '';
				label = `${prefix}${formatLongDate(task.dueDate, locale())}`;
			}
			let group = result.find((g) => g.key === key);
			if (!group) {
				group = { key, label, tasks: [] };
				result.push(group);
			}
			group.tasks.push(task);
		}
		return result;
	});

	const listOptions = $derived([
		{ value: '', label: t('dashboard.allLists') },
		...lists.items.map((l) => ({ value: l.id, label: l.name }))
	]);

	const sortOptions = $derived([
		{ value: 'due', label: t('upcoming.sortDue') },
		{ value: 'priority', label: t('upcoming.sortPriority') },
		{ value: 'created', label: t('upcoming.sortCreated') }
	]);
</script>

<svelte:head><title>{t('upcoming.title')} – {t('app.name')}</title></svelte:head>

<PageHeader eyebrow={t('upcoming.eyebrow')} title={t('upcoming.title')} />

{#if tasks.status === 'error'}
	<ErrorState
		title={t('common.errorTitle')}
		message={tasks.error?.message ?? t('common.errorGeneric')}
		retryLabel={t('common.retry')}
		onretry={() => void tasks.load(true)}
	/>
{:else if tasks.isLoading}
	<div class="flex flex-col gap-3" aria-busy="true">
		<Skeleton class="h-[60px] rounded-[18px]" />
		{#each [1, 2, 3] as i (i)}<Skeleton class="h-[68px] rounded-[18px]" />{/each}
	</div>
{:else}
	<!-- Filter bar (Figma: "Filter Alle Listen · Sortieren: Fälligkeitsdatum") -->
	<div
		class="mb-8 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-[18px] border border-border bg-surface px-4 py-3 sm:px-5"
	>
		<label class="flex items-center gap-2 text-[12px] text-muted">
			{t('upcoming.filterList')}
			<Select bind:value={listFilter} options={listOptions} size="sm" class="w-40" />
		</label>
		<label class="flex items-center gap-2 text-[12px] text-muted">
			{t('upcoming.sort')}
			<Select bind:value={sort} options={sortOptions} size="sm" class="w-40" />
		</label>
		<span class="ml-auto text-[12px] text-muted"
			>{t('common.taskCount', { count: filtered.length })}</span
		>
	</div>

	{#if filtered.length === 0}
		<EmptyState icon="calendar" title={t('upcoming.empty')} description={t('upcoming.emptyHint')} />
	{:else}
		<div class="flex flex-col gap-10">
			{#each groups as group (group.key)}
				<TaskSection label={group.label} tasks={group.tasks} />
			{/each}
		</div>
	{/if}
{/if}
