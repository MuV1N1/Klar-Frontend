<script lang="ts">
	import { goto } from '$app/navigation';

	import { localizedHref, useLocale, useTranslations } from '#lib/i18n/index.ts';
	import { lists } from '#lib/stores/lists.svelte.ts';
	import { settings } from '#lib/stores/settings.svelte.ts';
	import { tasks } from '#lib/stores/tasks.svelte.ts';
	import { toasts } from '#lib/stores/toasts.svelte.ts';
	import { ui } from '#lib/stores/ui.svelte.ts';
	import type { Task } from '#lib/types/index.ts';
	import { formatShortDate, formatTime, isPast, relativeDueKey } from '#lib/utils/date.ts';

	import { colorOf } from '../lists/listHelpers.ts';
	import Checkbox from '../ui/Checkbox.svelte';
	import Chip from '../ui/Chip.svelte';
	import Icon from '../ui/Icon.svelte';
	import IconButton from '../ui/IconButton.svelte';
	import Menu, { type MenuItem } from '../ui/Menu.svelte';

	interface Props {
		task: Task;
		/** Hide the list chip (e.g. inside a list page). */
		hideList?: boolean;
		/** Hide the date (e.g. on the "today" section). */
		hideDate?: boolean;
		highlight?: boolean;
	}

	let { task, hideList = false, hideDate = false, highlight = false }: Props = $props();

	const t = useTranslations();
	const locale = useLocale();

	const list = $derived(lists.byId(task.listId));
	const listColor = $derived(colorOf(list));
	const overdue = $derived(!task.completed && isPast(task.dueDate));
	const pending = $derived(tasks.isPending(task.id));

	const dueLabel = $derived.by(() => {
		if (!task.dueDate) return null;
		const key = relativeDueKey(task.dueDate);
		return key ? t(`common.${key}`) : formatShortDate(task.dueDate, locale());
	});

	async function toggle(checked: boolean) {
		try {
			await tasks.setCompleted(task.id, checked);
			toasts.success(t(checked ? 'tasks.completed' : 'tasks.reopened', { title: task.title }), {
				label: t('tasks.markOpen'),
				onClick: () => void tasks.setCompleted(task.id, !checked)
			});
		} catch {
			toasts.error(t('common.errorGeneric'));
		}
	}

	async function remove() {
		if (settings.value.confirmDelete && !confirm(t('tasks.deleteConfirm', { title: task.title })))
			return;
		try {
			await tasks.remove(task.id);
			toasts.success(t('tasks.deleted'));
		} catch {
			toasts.error(t('common.errorGeneric'));
		}
	}

	const menuItems = $derived<MenuItem[]>([
		{ id: 'edit', label: t('common.edit'), icon: 'pencil', onSelect: () => ui.openEditTask(task) },
		{
			id: 'toggle',
			label: task.completed ? t('tasks.markOpen') : t('tasks.markDone'),
			icon: task.completed ? 'rotate' : 'check',
			onSelect: () => void toggle(!task.completed)
		},
		{
			id: 'focus',
			label: t('tasks.focusOn'),
			icon: 'zap',
			disabled: task.completed,
			onSelect: () => void goto(localizedHref(locale(), `/app/focus?task=${task.id}`))
		},
		{
			id: 'delete',
			label: t('common.delete'),
			icon: 'trash',
			danger: true,
			onSelect: () => void remove()
		}
	]);
</script>

<!-- Task row (Figma "Heute": surface card, circle check, title, time, list chip) -->
<div
	class={`group @container relative flex items-center gap-3 rounded-[18px] border bg-surface px-3 py-3 transition-[border-color,background-color,transform] duration-150 sm:gap-4 sm:px-5 sm:py-4 ${
		highlight ? 'border-accent-line' : 'border-border hover:border-border-strong'
	} ${task.completed ? 'opacity-70' : ''} ${pending ? 'pointer-events-none opacity-60' : ''}`}
>
	<Checkbox
		checked={task.completed}
		label={task.completed ? t('tasks.markOpen') : t('tasks.markDone')}
		color={task.priority === 'high' && !task.completed ? 'var(--danger)' : listColor}
		onchange={toggle}
	/>

	<button
		type="button"
		class="flex min-w-0 flex-1 flex-col items-start gap-0.5 text-left"
		onclick={() => ui.openEditTask(task)}
	>
		<span
			class={`w-full truncate text-[14px] font-medium text-fg-2 group-hover:text-fg ${task.completed ? 'line-through decoration-muted/60' : ''}`}
		>
			{task.title}
		</span>
		{#if task.description}
			<span class="line-clamp-1 text-[12px] text-muted">{task.description}</span>
		{/if}
		<!-- Mobile meta row -->
		<span class="mt-1 flex flex-wrap items-center gap-2 @xl:hidden">
			{#if !hideDate && dueLabel}
				<span
					class={`flex items-center gap-1 text-[11px] ${overdue ? 'text-danger-text' : 'text-muted'}`}
				>
					<Icon name="clock" size={11} />
					{dueLabel}{task.dueTime ? ` · ${formatTime(task.dueTime, locale())}` : ''}
				</span>
			{:else if task.dueTime}
				<span class="flex items-center gap-1 text-[11px] text-muted">
					<Icon name="clock" size={11} />{formatTime(task.dueTime, locale())}
				</span>
			{/if}
			{#if list && !hideList}
				<Chip color={listColor ?? undefined} size="sm">{list.name}</Chip>
			{/if}
		</span>
	</button>

	<!-- Desktop meta -->
	<div class="hidden shrink-0 items-center gap-4 @xl:flex">
		{#if task.priority === 'high' && !task.completed}
			<span
				class="flex items-center gap-1 text-[12px] font-medium text-danger-text"
				title={t('tasks.priorities.high')}
			>
				<Icon name="flag" size={13} />
			</span>
		{:else if task.priority === 'low' && !task.completed}
			<span class="text-muted/60" title={t('tasks.priorities.low')}
				><Icon name="flag" size={13} /></span
			>
		{/if}
		{#if (!hideDate && dueLabel) || task.dueTime}
			<span
				class={`flex items-center gap-1.5 text-[12px] ${overdue ? 'text-danger-text' : 'text-muted'}`}
			>
				<Icon name="clock" size={13} />
				{#if !hideDate && dueLabel}{dueLabel}{/if}
				{#if !hideDate && dueLabel && task.dueTime}<span aria-hidden="true">·</span>{/if}
				{#if task.dueTime}{formatTime(task.dueTime, locale())}{/if}
			</span>
		{/if}
		{#if list && !hideList}
			<Chip color={listColor ?? undefined}>{list.name}</Chip>
		{/if}
	</div>

	<Menu items={menuItems} label={t('navigation.more')}>
		{#snippet trigger(open)}
			<IconButton
				icon="moreHorizontal"
				label={t('navigation.more')}
				size="sm"
				class={`${open ? 'opacity-100' : 'sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100'}`}
			/>
		{/snippet}
	</Menu>
</div>
