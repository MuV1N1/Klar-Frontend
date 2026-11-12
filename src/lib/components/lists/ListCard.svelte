<script lang="ts">
	import { localizedHref, useLocale, useTranslations } from '#lib/i18n/index.ts';
	import { tasks } from '#lib/stores/tasks.svelte.ts';
	import type { TaskList } from '#lib/types/index.ts';

	import Icon from '../ui/Icon.svelte';
	import { listColorValue, listIconName } from './listHelpers.ts';

	let { list }: { list: TaskList } = $props();

	const t = useTranslations();
	const locale = useLocale();

	const color = $derived(listColorValue(list.color));
	const open = $derived(tasks.openCountForList(list.id));
	const done = $derived(tasks.forList(list.id).completed.length);
	const total = $derived(open + done);
	const percent = $derived(total > 0 ? Math.round((done / total) * 100) : 0);
</script>

<a
	href={localizedHref(locale(), `/app/lists/${list.id}`)}
	class="group flex flex-col gap-3 rounded-[18px] border border-border bg-surface px-5 py-4 transition-colors duration-150 hover:border-border-strong"
>
	<div class="flex items-center gap-3">
		<span style={`color:${color}`}><Icon name={listIconName(list.icon)} size={17} /></span>
		<h3 class="min-w-0 flex-1 truncate text-[14px] font-medium text-fg">{list.name}</h3>
		<span class="text-[13px] text-muted tabular-nums" title={t('lists.openTasks', { count: open })}>
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
