<script lang="ts">
	import { localizedHref, useLocale, useTranslations } from '#lib/i18n/index.ts';
	import { groups } from '#lib/stores/groups.svelte.ts';
	import { tasks } from '#lib/stores/tasks.svelte.ts';
	import { ui } from '#lib/stores/ui.svelte.ts';
	import type { TaskList } from '#lib/types/index.ts';

	import Icon from '../ui/Icon.svelte';
	import IconButton from '../ui/IconButton.svelte';
	import Menu, { type MenuItem } from '../ui/Menu.svelte';
	import { deleteList } from './listActions.ts';
	import { listColorValue, listIconName, listPath } from './listHelpers.ts';

	let { list }: { list: TaskList } = $props();

	const t = useTranslations();
	const locale = useLocale();

	const color = $derived(listColorValue(list.color));
	const counts = $derived.by(() => {
		if (list.kind !== 'shopping') {
			return {
				open: tasks.openCountForList(list.id),
				done: tasks.forList(list.id).completed.length
			};
		}
		const items = tasks.forShoppingList(list.id);
		return { open: items.open.length, done: items.bought.length };
	});
	const open = $derived(counts.open);
	const done = $derived(counts.done);
	const total = $derived(open + done);
	const percent = $derived(total > 0 ? Math.round((done / total) * 100) : 0);

	const menuItems = $derived<MenuItem[]>([
		{ id: 'edit', label: t('common.edit'), icon: 'pencil', onSelect: () => ui.openEditList(list) },
		{
			id: 'delete',
			label: t('common.delete'),
			icon: 'trash',
			danger: true,
			onSelect: () => void deleteList(list, t, locale())
		}
	]);
</script>

<div class="group relative">
	<!-- The whole card is a soft block of the list colour; the open count is the figure -->
	<a
		href={localizedHref(locale(), listPath(list))}
		style={`--c:${color}`}
		class="fill-card pressable flex flex-col gap-4 rounded-[22px] p-5 transition-transform duration-200 hover:-translate-y-0.5"
	>
		<div class="flex items-center gap-3 pr-9">
			<span
				class="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-surface"
				style={`color:${color}`}
			>
				<Icon name={listIconName(list.icon)} size={18} />
			</span>
			<h3 class="min-w-0 flex-1 truncate font-display text-[20px] font-bold tracking-tight text-fg">
				{list.name}
			</h3>
		</div>
		<div class="flex flex-col gap-2">
			<div class="flex min-w-0 flex-col">
				<span class="font-display text-[44px] leading-none font-bold text-fg tabular-nums"
					>{open}</span
				>
				<span class="truncate text-[13px] text-fg-2">
					{list.kind === 'shopping' ? t('shopping.cardOpen') : t('lists.cardOpen', { done })}
				</span>
			</div>
			{#if list.groupId}
				<span class="flex min-w-0 items-center gap-1.5 text-[12px] text-fg-2">
					<Icon name="users" size={14} />
					<span class="truncate">
						{t('groups.sharedWith', { name: groups.byId(list.groupId)?.name ?? '' })}
					</span>
				</span>
			{/if}
		</div>
		{#if list.description}
			<p class="-mt-2 line-clamp-1 text-[13px] text-fg-2">{list.description}</p>
		{/if}
		{#if list.kind !== 'shopping'}
			<div
				class="h-1.5 w-full overflow-hidden rounded-full"
				style={`background:color-mix(in srgb, ${color} 18%, var(--track))`}
				aria-hidden="true"
			>
				<div
					class="h-full rounded-full transition-[width] duration-500"
					style={`width:${percent}%; background:${color}`}
				></div>
			</div>
		{/if}
	</a>

	<!-- Edit / delete: sits next to the link, not inside it -->
	<div class="absolute top-5 right-4">
		<Menu items={menuItems} label={t('navigation.more')}>
			{#snippet trigger()}
				<IconButton icon="moreHorizontal" label={t('navigation.more')} size="sm" />
			{/snippet}
		</Menu>
	</div>
</div>
