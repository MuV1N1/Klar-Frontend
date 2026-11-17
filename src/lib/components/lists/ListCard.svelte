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
	<a
		href={localizedHref(locale(), listPath(list))}
		class="flex flex-col gap-3 rounded-[18px] border border-border bg-surface px-5 py-4 transition-colors duration-150 hover:border-border-strong"
	>
		<div class="flex items-center gap-3 pr-9">
			<span style={`color:${color}`}><Icon name={listIconName(list.icon)} size={17} /></span>
			<h3 class="min-w-0 flex-1 truncate text-[14px] font-medium text-fg">{list.name}</h3>
			{#if list.groupId}
				<span
					class="text-muted"
					title={t('groups.sharedWith', { name: groups.byId(list.groupId)?.name ?? '' })}
				>
					<Icon name="users" size={14} />
				</span>
			{/if}
			<span
				class="text-[13px] text-muted tabular-nums"
				title={t(list.kind === 'shopping' ? 'shopping.toBuy' : 'lists.openTasks', { count: open })}
			>
				{open}
			</span>
		</div>
		{#if list.description}
			<p class="line-clamp-1 text-[12px] text-muted">{list.description}</p>
		{/if}
		<div class="h-1 w-full overflow-hidden rounded-full bg-track" aria-hidden="true">
			<div
				class="h-full rounded-full transition-[width] duration-500"
				style={`width:${percent}%; background:${color}`}
			></div>
		</div>
	</a>

	<!-- Edit / delete: sits next to the link, not inside it -->
	<div class="absolute top-2.5 right-2.5">
		<Menu items={menuItems} label={t('navigation.more')}>
			{#snippet trigger()}
				<IconButton icon="moreHorizontal" label={t('navigation.more')} size="sm" />
			{/snippet}
		</Menu>
	</div>
</div>
