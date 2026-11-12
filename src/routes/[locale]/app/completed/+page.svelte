<script lang="ts">
	import TaskSection from '#lib/components/tasks/TaskSection.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import EmptyState from '#lib/components/ui/EmptyState.svelte';
	import ErrorState from '#lib/components/ui/ErrorState.svelte';
	import PageHeader from '#lib/components/ui/PageHeader.svelte';
	import Skeleton from '#lib/components/ui/Skeleton.svelte';
	import { useLocale, useTranslations } from '#lib/i18n/index.ts';
	import { tasks } from '#lib/stores/tasks.svelte.ts';
	import { toasts } from '#lib/stores/toasts.svelte.ts';
	import type { Task } from '#lib/types/index.ts';
	import { formatLongDate, relativeDueKey } from '#lib/utils/date.ts';

	const t = useTranslations();
	const locale = useLocale();

	interface Group {
		key: string;
		label: string;
		tasks: Task[];
	}

	/** Completed tasks grouped by completion day. */
	const groups = $derived.by<Group[]>(() => {
		const result: Group[] = [];
		for (const task of tasks.completed) {
			const day = task.completedAt?.slice(0, 10) ?? 'unknown';
			let group = result.find((g) => g.key === day);
			if (!group) {
				const rel = day === 'unknown' ? null : relativeDueKey(day);
				const label = rel
					? t(`common.${rel}`)
					: day === 'unknown'
						? '—'
						: formatLongDate(day, locale());
				group = { key: day, label, tasks: [] };
				result.push(group);
			}
			group.tasks.push(task);
		}
		return result;
	});

	let clearing = $state(false);

	async function clearAll() {
		if (!confirm(t('completed.clearConfirm'))) return;
		clearing = true;
		try {
			await tasks.removeMany(tasks.completed.map((task) => task.id));
			toasts.success(t('tasks.deleted'));
		} catch {
			toasts.error(t('common.errorGeneric'));
		} finally {
			clearing = false;
		}
	}
</script>

<svelte:head><title>{t('completed.title')} – {t('app.name')}</title></svelte:head>

<PageHeader eyebrow={t('completed.eyebrow')} title={t('completed.title')}>
	{#snippet actions()}
		{#if tasks.completed.length}
			<Button variant="ghost" size="sm" icon="trash" loading={clearing} onclick={clearAll}>
				{t('completed.clearAll')}
			</Button>
		{/if}
	{/snippet}
</PageHeader>

{#if tasks.status === 'error'}
	<ErrorState
		title={t('common.errorTitle')}
		message={tasks.error?.message ?? t('common.errorGeneric')}
		retryLabel={t('common.retry')}
		onretry={() => void tasks.load(true)}
	/>
{:else if tasks.isLoading}
	<div class="flex flex-col gap-3" aria-busy="true">
		{#each [1, 2, 3, 4] as i (i)}<Skeleton class="h-10" />{/each}
	</div>
{:else if tasks.completed.length === 0}
	<EmptyState
		icon="checkCircle"
		title={t('completed.empty')}
		description={t('completed.emptyHint')}
	/>
{:else}
	<div class="flex flex-col gap-8">
		{#each groups as group (group.key)}
			<TaskSection
				label={group.label}
				tasks={group.tasks}
				count={group.tasks.length}
				variant="completed"
			/>
		{/each}
	</div>
{/if}
