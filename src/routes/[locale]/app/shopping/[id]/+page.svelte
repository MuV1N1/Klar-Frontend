<script lang="ts">
	import { page } from '$app/state';

	import { deleteList } from '#lib/components/lists/listActions.ts';
	import { listColorValue } from '#lib/components/lists/listHelpers.ts';
	import Avatar from '#lib/components/ui/Avatar.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import EmptyState from '#lib/components/ui/EmptyState.svelte';
	import ErrorState from '#lib/components/ui/ErrorState.svelte';
	import IconButton from '#lib/components/ui/IconButton.svelte';
	import Menu, { type MenuItem } from '#lib/components/ui/Menu.svelte';
	import PageHeader from '#lib/components/ui/PageHeader.svelte';
	import Skeleton from '#lib/components/ui/Skeleton.svelte';
	import { localizedHref, useLocale, useTranslations } from '#lib/i18n/index.ts';
	import { CATEGORY_COLORS, itemCategory, suggestItems } from '#lib/shopping/catalog.ts';
	import { groups } from '#lib/stores/groups.svelte.ts';
	import { lists } from '#lib/stores/lists.svelte.ts';
	import { tasks } from '#lib/stores/tasks.svelte.ts';
	import { toasts } from '#lib/stores/toasts.svelte.ts';
	import { ui } from '#lib/stores/ui.svelte.ts';
	import type { Task } from '#lib/types/index.ts';

	const t = useTranslations();
	const locale = useLocale();

	const list = $derived(lists.byId(page.params.id));
	const group = $derived(groups.byId(list?.groupId));
	const items = $derived(
		page.params.id ? tasks.forShoppingList(page.params.id) : { open: [], bought: [] }
	);

	const cartPercent = $derived.by(() => {
		const total = items.open.length + items.bought.length;
		return total ? Math.round((items.bought.length / total) * 100) : 0;
	});

	let query = $state('');
	const suggestions = $derived(suggestItems(query, locale()));

	// Input binds a string, so the quantity is parsed and clamped to what the backend accepts
	let amount = $state('1');
	const amountValue = $derived(Math.min(Math.max(Number.parseInt(amount, 10) || 1, 1), 200));

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

	/** Like Bring: an item that is already open gets the amount added instead of a duplicate. */
	async function add(name: string) {
		const title = name.trim();
		if (!title || !list) return;
		const quantity = amountValue;
		query = '';
		amount = '1';
		try {
			const open = items.open.find((task) => sameName(task, title));
			const bought = items.bought.find((task) => sameName(task, title));
			if (open) await tasks.update(open.id, { quantity: Math.min(open.quantity + quantity, 200) });
			else if (bought) await tasks.update(bought.id, { completed: false, quantity });
			else await tasks.create({ title, listId: list.id, quantity });
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

<!-- Open item: a soft card in the colour of its aisle, tap = in the cart -->
{#snippet card(task: Task)}
	{@const category = itemCategory(task.title)}
	<button
		type="button"
		onclick={() => void toggle(task)}
		disabled={tasks.isPending(task.id)}
		aria-label={t('shopping.markBought', { item: task.title })}
		style={`--c:${CATEGORY_COLORS[category]}`}
		class="fill-card pressable relative flex min-h-[120px] animate-card-in flex-col justify-between gap-4 rounded-[22px] p-4 text-left transition-transform duration-200 hover:-translate-y-0.5 disabled:opacity-60"
	>
		{#if task.quantity > 1}
			<span
				class="absolute -top-2 -right-1.5 flex h-7 min-w-9 items-center justify-center rounded-full bg-fg px-2 font-display text-[14px] font-bold text-surface tabular-nums"
				>{task.quantity}×</span
			>
		{/if}
		<span
			class="font-display text-[19px] leading-[1.15] font-bold tracking-[-0.01em] break-words text-fg"
			>{task.title}</span
		>
		<span class="text-[12px] text-fg-2">{t(`shopping.categories.${category}`)}</span>
	</button>
{/snippet}

<!-- Bought item: a crossed-out chip, tap = back on the list -->
{#snippet chip(task: Task)}
	<span class="flex items-center rounded-full bg-surface-2">
		<button
			type="button"
			onclick={() => void toggle(task)}
			disabled={tasks.isPending(task.id)}
			aria-label={t('shopping.addAgain', { item: task.title })}
			class="flex h-9 items-center rounded-full pr-1 pl-3.5 text-[14px] text-muted transition-colors hover:text-fg"
		>
			<s
				class="decoration-2"
				style={`text-decoration-color:${CATEGORY_COLORS[itemCategory(task.title)]}`}>{task.title}</s
			>
		</button>
		<IconButton
			icon="x"
			size="sm"
			label={t('shopping.remove', { item: task.title })}
			onclick={() => void remove(task)}
		/>
	</span>
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
		<div class="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
			{#each [1, 2, 3, 4, 5, 6] as i (i)}<Skeleton class="h-[120px] rounded-[22px]" />{/each}
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
		eyebrow={group
			? `${t('shopping.title')} · ${t('groups.sharedWith', { name: group.name })}`
			: t('shopping.title')}
		title={list.name}
		titleAccent={listColorValue(list.color)}
		description={list.description ?? undefined}
	>
		{#snippet actions()}
			{#if group}
				<span class="mr-1 flex">
					{#each group.members.slice(0, 4) as member (member.id)}
						<Avatar
							id={member.id}
							name={member.name}
							size={34}
							class="-ml-1 outline-2 outline-surface first:ml-0"
						/>
					{/each}
				</span>
			{/if}
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
		<!-- How far the shop is: open vs. already in the cart -->
		<div
			class="fill-card flex items-center gap-4 rounded-[18px] px-4 py-3"
			style={`--c:${listColorValue(list.color)}`}
		>
			<span class="font-display text-[24px] leading-none font-bold tabular-nums"
				>{items.open.length}</span
			>
			<span class="text-[13px] text-fg-2">{t('shopping.cardOpen')}</span>
			<span
				class="h-2.5 flex-1 overflow-hidden rounded-full"
				style={`background:color-mix(in srgb, ${listColorValue(list.color)} 20%, var(--track))`}
				aria-hidden="true"
			>
				<span
					class="block h-full rounded-full transition-[width] duration-500"
					style={`width:${cartPercent}%;background:${listColorValue(list.color)}`}
				></span>
			</span>
			<span class="text-[13px] whitespace-nowrap text-fg-2">
				{t('shopping.inCartCount', { count: items.bought.length })}
			</span>
		</div>

		<form
			class="flex flex-col gap-3"
			onsubmit={(event) => {
				event.preventDefault();
				void add(query);
			}}
		>
			<div
				class="flex gap-2 rounded-[20px] bg-surface p-2 shadow-[inset_0_0_0_2px_var(--border),0_3px_0_var(--border)] focus-within:shadow-[inset_0_0_0_2px_var(--accent-line),0_3px_0_var(--border)]"
			>
				<input
					bind:value={query}
					placeholder={t('shopping.addPlaceholder')}
					aria-label={t('shopping.addPlaceholder')}
					autocomplete="off"
					class="min-w-0 flex-1 border-0 bg-transparent px-3 text-[17px] font-medium text-fg placeholder:text-muted focus:ring-0"
				/>
				<div
					class="flex h-12 flex-none items-center rounded-[12px] bg-surface-2 px-1"
					role="group"
					aria-label={t('shopping.quantity')}
				>
					<IconButton
						icon="minus"
						label={t('shopping.less')}
						disabled={amountValue <= 1}
						onclick={() => (amount = String(amountValue - 1))}
					/>
					<input
						bind:value={amount}
						type="number"
						inputmode="numeric"
						min="1"
						max="200"
						aria-label={t('shopping.quantity')}
						class="w-9 [appearance:textfield] border-0 bg-transparent p-0 text-center text-[15px] font-medium text-fg focus:ring-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
					/>
					<IconButton
						icon="plus"
						label={t('shopping.more')}
						disabled={amountValue >= 200}
						onclick={() => (amount = String(amountValue + 1))}
					/>
				</div>
				<Button type="submit" variant="primary" icon="plus" class="h-12!">
					<span class="max-sm:sr-only">{t('shopping.add')}</span>
				</Button>
			</div>
			{#if suggestions.length}
				<div class="flex flex-wrap gap-2">
					{#each suggestions as suggestion (suggestion.name)}
						<button
							type="button"
							onclick={() => void add(suggestion.name)}
							style={`--c:${CATEGORY_COLORS[suggestion.category]}`}
							class="fill-card pressable h-8 rounded-full px-3.5 text-[13px] font-medium text-fg [box-shadow:0_2px_0_color-mix(in_srgb,var(--c)_45%,var(--surface))]"
						>
							{suggestion.name}
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
				<div class="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
					{#each items.open as task (task.id)}{@render card(task)}{/each}
				</div>
			{/if}
		</section>

		{#if items.bought.length}
			<section class="flex flex-col gap-3">
				<h2 class="section-label">{t('shopping.recent')} · {items.bought.length}</h2>
				<div class="flex flex-wrap gap-2">
					{#each items.bought.slice(0, 24) as task (task.id)}{@render chip(task)}{/each}
				</div>
			</section>
		{/if}
	</div>
{/if}
