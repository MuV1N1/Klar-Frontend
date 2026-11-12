<script lang="ts">
	import QuickAdd from '#lib/components/tasks/QuickAdd.svelte';
	import TaskSection from '#lib/components/tasks/TaskSection.svelte';
	import EmptyState from '#lib/components/ui/EmptyState.svelte';
	import ErrorState from '#lib/components/ui/ErrorState.svelte';
	import PageHeader from '#lib/components/ui/PageHeader.svelte';
	import Skeleton from '#lib/components/ui/Skeleton.svelte';
	import { useTranslations } from '#lib/i18n/index.ts';
	import { tasks } from '#lib/stores/tasks.svelte.ts';

	const t = useTranslations();
</script>

<svelte:head><title>{t('inbox.title')} – {t('app.name')}</title></svelte:head>

<PageHeader
	eyebrow={t('inbox.eyebrow')}
	title={t('inbox.title')}
	description={t('inbox.description')}
/>

{#if tasks.status === 'error'}
	<ErrorState
		title={t('common.errorTitle')}
		message={tasks.error?.message ?? t('common.errorGeneric')}
		retryLabel={t('common.retry')}
		onretry={() => void tasks.load(true)}
	/>
{:else if tasks.isLoading}
	<div class="flex flex-col gap-3" aria-busy="true">
		<Skeleton class="h-[66px] rounded-[18px]" />
		{#each [1, 2, 3] as i (i)}<Skeleton class="h-[68px] rounded-[18px]" />{/each}
	</div>
{:else}
	<div class="flex flex-col gap-10">
		<QuickAdd
			placeholder={t('inbox.placeholder')}
			defaults={{ listId: null, dueDate: null }}
			variant="button"
		/>

		<TaskSection label={t('inbox.unassigned')} tasks={tasks.inbox} count={tasks.inbox.length}>
			{#snippet empty()}
				<EmptyState icon="inbox" title={t('inbox.empty')} description={t('inbox.emptyHint')} />
			{/snippet}
		</TaskSection>
	</div>
{/if}
