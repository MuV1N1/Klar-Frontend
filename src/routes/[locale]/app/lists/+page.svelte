<script lang="ts">
	import ListCard from '#lib/components/lists/ListCard.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import EmptyState from '#lib/components/ui/EmptyState.svelte';
	import ErrorState from '#lib/components/ui/ErrorState.svelte';
	import PageHeader from '#lib/components/ui/PageHeader.svelte';
	import Skeleton from '#lib/components/ui/Skeleton.svelte';
	import { useTranslations } from '#lib/i18n/index.ts';
	import { lists } from '#lib/stores/lists.svelte.ts';
	import { ui } from '#lib/stores/ui.svelte.ts';

	const t = useTranslations();
</script>

<svelte:head><title>{t('lists.title')} – {t('app.name')}</title></svelte:head>

<PageHeader
	eyebrow={t('lists.eyebrow')}
	title={t('lists.title')}
	description={t('lists.description')}
>
	{#snippet actions()}
		<Button variant="primary" icon="plus" onclick={() => ui.openNewList()}>{t('lists.new')}</Button>
	{/snippet}
</PageHeader>

{#if lists.status === 'error'}
	<ErrorState
		title={t('common.errorTitle')}
		message={lists.error?.message ?? t('common.errorGeneric')}
		retryLabel={t('common.retry')}
		onretry={() => void lists.load(true)}
	/>
{:else if lists.isLoading}
	<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
		{#each [1, 2, 3] as i (i)}<Skeleton class="h-[150px] rounded-[18px]" />{/each}
	</div>
{:else if lists.items.length === 0}
	<EmptyState icon="layers" title={t('lists.empty')} description={t('lists.emptyHint')}>
		<Button variant="primary" size="sm" icon="plus" onclick={() => ui.openNewList()}
			>{t('lists.new')}</Button
		>
	</EmptyState>
{:else}
	<div class="grid animate-rise-in gap-3 sm:grid-cols-2 lg:grid-cols-3">
		{#each lists.items as list (list.id)}
			<ListCard {list} />
		{/each}
	</div>
{/if}
