<script lang="ts">
	import { page } from '$app/state';

	import { deleteList } from '#lib/components/lists/listActions.ts';
	import { listColorValue } from '#lib/components/lists/listHelpers.ts';
	import QuickAdd from '#lib/components/tasks/QuickAdd.svelte';
	import TaskSection from '#lib/components/tasks/TaskSection.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import EmptyState from '#lib/components/ui/EmptyState.svelte';
	import ErrorState from '#lib/components/ui/ErrorState.svelte';
	import IconButton from '#lib/components/ui/IconButton.svelte';
	import Menu, { type MenuItem } from '#lib/components/ui/Menu.svelte';
	import PageHeader from '#lib/components/ui/PageHeader.svelte';
	import Skeleton from '#lib/components/ui/Skeleton.svelte';
	import { localizedHref, useLocale, useTranslations } from '#lib/i18n/index.ts';
	import { lists } from '#lib/stores/lists.svelte.ts';
	import { tasks } from '#lib/stores/tasks.svelte.ts';
	import { ui } from '#lib/stores/ui.svelte.ts';

	const t = useTranslations();
	const locale = useLocale();

	const list = $derived(lists.byId(page.params.id));
	const listTasks = $derived(
		page.params.id ? tasks.forList(page.params.id) : { open: [], completed: [] }
	);

	const menuItems = $derived<MenuItem[]>([
		{
			id: 'edit',
			label: t('common.edit'),
			icon: 'pencil',
			onSelect: () => list && ui.openEditList(list)
		},
		{
			id: 'delete',
			label: t('common.delete'),
			icon: 'trash',
			danger: true,
			onSelect: () => list && void deleteList(list, t, locale())
		}
	]);
</script>

<svelte:head><title>{list?.name ?? t('lists.title')} – {t('app.name')}</title></svelte:head>

{#if lists.status === 'error' || tasks.status === 'error'}
	<ErrorState
		title={t('common.errorTitle')}
		message={(lists.error ?? tasks.error)?.message ?? t('common.errorGeneric')}
		retryLabel={t('common.retry')}
		onretry={() => {
			void lists.load(true);
			void tasks.load(true);
		}}
	/>
{:else if lists.isLoading || tasks.isLoading}
	<div class="flex flex-col gap-6" aria-busy="true">
		<Skeleton class="h-4 w-40" />
		<Skeleton class="h-8 w-56" />
		<Skeleton class="h-[66px] rounded-[18px]" />
		{#each [1, 2, 3] as i (i)}<Skeleton class="h-[68px] rounded-[18px]" />{/each}
	</div>
{:else if !list}
	<EmptyState icon="alertCircle" title={t('lists.notFound')}>
		<Button
			variant="outline"
			size="sm"
			href={localizedHref(locale(), '/app/lists')}
			icon="arrowLeft">{t('common.back')}</Button
		>
	</EmptyState>
{:else}
	<PageHeader
		eyebrow={t('lists.breadcrumb', { name: list.name })}
		title={list.name}
		titleAccent={listColorValue(list.color)}
		description={list.description ?? t('lists.openTasks', { count: listTasks.open.length })}
	>
		{#snippet actions()}
			<Menu items={menuItems} label={t('navigation.more')}>
				{#snippet trigger()}
					<IconButton
						icon="moreHorizontal"
						label={t('navigation.more')}
						variant="surface"
						size="lg"
					/>
				{/snippet}
			</Menu>
		{/snippet}
	</PageHeader>

	<div class="flex flex-col gap-10">
		<QuickAdd
			placeholder={t('tasks.addToList', { list: list.name })}
			defaults={{ listId: list.id }}
		/>

		<TaskSection
			label={t('tasks.open')}
			tasks={listTasks.open}
			count={listTasks.open.length}
			hideList
		>
			{#snippet empty()}
				<EmptyState
					icon="list"
					title={t('lists.emptyTasks')}
					description={t('lists.emptyTasksHint')}
					compact
				/>
			{/snippet}
		</TaskSection>

		{#if listTasks.completed.length}
			<TaskSection
				label={t('tasks.done')}
				tasks={listTasks.completed}
				count={listTasks.completed.length}
				variant="completed"
			/>
		{/if}
	</div>
{/if}
