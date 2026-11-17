<script lang="ts">
	import { page } from '$app/state';

	import { deleteList } from '#lib/components/lists/listActions.ts';
	import { listColorValue } from '#lib/components/lists/listHelpers.ts';
	import Button from '#lib/components/ui/Button.svelte';
	import EmptyState from '#lib/components/ui/EmptyState.svelte';
	import ErrorState from '#lib/components/ui/ErrorState.svelte';
	import Icon from '#lib/components/ui/Icon.svelte';
	import IconButton from '#lib/components/ui/IconButton.svelte';
	import Input from '#lib/components/ui/Input.svelte';
	import Menu, { type MenuItem } from '#lib/components/ui/Menu.svelte';
	import PageHeader from '#lib/components/ui/PageHeader.svelte';
	import Skeleton from '#lib/components/ui/Skeleton.svelte';
	import { localizedHref, useLocale, useTranslations } from '#lib/i18n/index.ts';
	import { itemEmoji, suggestItems } from '#lib/shopping/catalog.ts';
	import { lists } from '#lib/stores/lists.svelte.ts';
	import { tasks } from '#lib/stores/tasks.svelte.ts';
	import { toasts } from '#lib/stores/toasts.svelte.ts';
	import { ui } from '#lib/stores/ui.svelte.ts';
	import type { Task } from '#lib/types/index.ts';

	const t = useTranslations();
	const locale = useLocale();

	const list = $derived(lists.byId(page.params.id));
	const items = $derived(
		page.params.id ? tasks.forShoppingList(page.params.id) : { open: [], bought: [] }
	);

	let query = $state('');
	const suggestions = $derived(suggestItems(query, locale()));

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

	const sameName = (task: Task, name: string) => task.title.toLowerCase() === name.toLowerCase();

	/** Like Bring: an item that was bought before goes back on the list instead of a duplicate. */
	async function add(name: string) {
		const title = name.trim();
		if (!title || !list) return;
		query = '';
		if (items.open.some((task) => sameName(task, title))) return;
		try {
			const bought = items.bought.find((task) => sameName(task, title));
			if (bought) await tasks.setCompleted(bought.id, false);
			else await tasks.create({ title, listId: list.id });
		} catch {
			toasts.error(t('common.errorGeneric'));
		}
	}

	async function toggle(task: Task) {
		try {
			await tasks.setCompleted(task.id, !task.completed);
		} catch {
			toasts.error(t('common.errorGeneric'));
		}
	}

	async function remove(task: Task) {
		try {
			await tasks.remove(task.id);
		} catch {
			toasts.error(t('common.errorGeneric'));
		}
	}
</script>

<svelte:head><title>{list?.name ?? t('shopping.title')} – {t('app.name')}</title></svelte:head>

{#snippet tile(task: Task, bought: boolean)}
	<div class="relative">
		<button
			type="button"
			onclick={() => void toggle(task)}
			disabled={tasks.isPending(task.id)}
			aria-label={t(bought ? 'shopping.addAgain' : 'shopping.markBought', { item: task.title })}
			class={`flex aspect-square w-full flex-col items-center justify-center gap-1.5 rounded-[18px] border p-2 text-center transition-[transform,colors] active:scale-95 ${
				bought
					? 'border-border bg-surface text-muted opacity-70 hover:opacity-100'
					: 'border-accent-line bg-accent-soft text-fg'
			}`}
		>
			<span class="text-[30px] leading-none" aria-hidden="true">{itemEmoji(task.title)}</span>
			<span class="line-clamp-2 text-[12px] leading-tight font-medium break-words"
				>{task.title}</span
			>
			{#if task.description}
				<span class="line-clamp-1 text-[11px] text-muted">{task.description}</span>
			{/if}
		</button>
		{#if bought}
			<div class="absolute top-1 right-1">
				<IconButton
					icon="x"
					size="sm"
					label={t('shopping.remove', { item: task.title })}
					onclick={() => void remove(task)}
				/>
			</div>
		{/if}
	</div>
{/snippet}

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
		<Skeleton class="h-8 w-56" />
		<Skeleton class="h-12 rounded-[14px]" />
		<div class="grid grid-cols-3 gap-3 sm:grid-cols-5">
			{#each [1, 2, 3, 4, 5, 6] as i (i)}<Skeleton class="aspect-square rounded-[18px]" />{/each}
		</div>
	</div>
{:else if !list || list.kind !== 'shopping'}
	<EmptyState icon="alertCircle" title={t('lists.notFound')}>
		<Button
			variant="outline"
			size="sm"
			href={localizedHref(locale(), '/app/shopping')}
			icon="arrowLeft">{t('common.back')}</Button
		>
	</EmptyState>
{:else}
	<PageHeader
		eyebrow={t('shopping.title')}
		title={list.name}
		titleAccent={listColorValue(list.color)}
		description={list.description ?? t('shopping.toBuy', { count: items.open.length })}
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

	<div class="flex flex-col gap-8">
		<form
			class="flex flex-col gap-3"
			onsubmit={(event) => {
				event.preventDefault();
				void add(query);
			}}
		>
			<div class="flex gap-2">
				<Input
					bind:value={query}
					size="lg"
					placeholder={t('shopping.addPlaceholder')}
					aria-label={t('shopping.addPlaceholder')}
					autocomplete="off"
					class="flex-1"
				/>
				<IconButton
					icon="plus"
					type="submit"
					variant="surface"
					size="lg"
					label={t('shopping.add')}
				/>
			</div>
			{#if suggestions.length}
				<div class="flex flex-wrap gap-2">
					{#each suggestions as suggestion (suggestion.name)}
						<button
							type="button"
							onclick={() => void add(suggestion.name)}
							class="flex items-center gap-1.5 rounded-full border border-border bg-surface-2 px-3 py-1.5 text-[13px] text-fg hover:border-border-strong"
						>
							<span aria-hidden="true">{suggestion.emoji}</span>{suggestion.name}
						</button>
					{/each}
				</div>
			{/if}
		</form>

		<section class="flex flex-col gap-3">
			<h2 class="section-label">{t('shopping.toBuyLabel')} · {items.open.length}</h2>
			{#if items.open.length === 0}
				<EmptyState
					icon="cart"
					title={t('shopping.emptyItems')}
					description={t('shopping.emptyItemsHint')}
					compact
				/>
			{:else}
				<div class="grid animate-rise-in grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-6">
					{#each items.open as task (task.id)}{@render tile(task, false)}{/each}
				</div>
			{/if}
		</section>

		{#if items.bought.length}
			<section class="flex flex-col gap-3">
				<h2 class="section-label flex items-center gap-2">
					<Icon name="clock" size={13} />{t('shopping.recent')}
				</h2>
				<div class="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-6">
					{#each items.bought.slice(0, 24) as task (task.id)}{@render tile(task, true)}{/each}
				</div>
			</section>
		{/if}
	</div>
{/if}
