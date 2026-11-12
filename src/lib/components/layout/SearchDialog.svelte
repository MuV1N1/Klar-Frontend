<script lang="ts">
	import { goto } from '$app/navigation';

	import { localizedHref, useLocale, useTranslations } from '#lib/i18n/index.ts';
	import { lists } from '#lib/stores/lists.svelte.ts';
	import { tasks } from '#lib/stores/tasks.svelte.ts';
	import { ui } from '#lib/stores/ui.svelte.ts';

	import { listColorValue } from '../lists/listHelpers.ts';
	import Icon from '../ui/Icon.svelte';

	const t = useTranslations();
	const locale = useLocale();

	let query = $state('');
	let dialog = $state<HTMLDialogElement | null>(null);
	let input = $state<HTMLInputElement | null>(null);

	const taskResults = $derived(tasks.search(query));
	const listResults = $derived(
		query.trim()
			? lists.items.filter((l) => l.name.toLowerCase().includes(query.trim().toLowerCase()))
			: []
	);

	$effect(() => {
		if (!dialog) return;
		if (ui.searchOpen && !dialog.open) {
			query = '';
			dialog.showModal();
			setTimeout(() => input?.focus(), 20);
		} else if (!ui.searchOpen && dialog.open) {
			dialog.close();
		}
	});

	// Ctrl/Cmd + K opens search
	$effect(() => {
		const onKey = (event: KeyboardEvent) => {
			if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
				event.preventDefault();
				ui.searchOpen = !ui.searchOpen;
			}
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	});

	function close() {
		ui.searchOpen = false;
	}

	function openList(id: string) {
		close();
		void goto(localizedHref(locale(), `/app/lists/${id}`));
	}
</script>

<dialog
	bind:this={dialog}
	oncancel={(event) => {
		event.preventDefault();
		close();
	}}
	onclick={(event) => {
		if (event.target === dialog) close();
	}}
	class="m-auto mt-[10vh] w-[calc(100%-2rem)] max-w-xl rounded-[20px] border border-border bg-surface p-0 text-fg shadow-2xl open:animate-pop-in"
>
	<div class="flex items-center gap-3 border-b border-border px-5">
		<Icon name="search" size={18} class="text-muted" />
		<input
			bind:this={input}
			bind:value={query}
			type="search"
			placeholder={t('search.placeholder')}
			aria-label={t('search.title')}
			class="h-14 min-w-0 flex-1 bg-transparent text-[15px] text-fg placeholder:text-muted focus:outline-none"
		/>
		<kbd class="rounded-md border border-border px-1.5 py-0.5 text-[10px] text-muted">Esc</kbd>
	</div>

	<div class="thin-scrollbar max-h-[50vh] overflow-y-auto p-2">
		{#if !query.trim()}
			<p class="px-4 py-6 text-center text-[13px] text-muted">{t('search.hint')}</p>
		{:else if taskResults.length === 0 && listResults.length === 0}
			<p class="px-4 py-6 text-center text-[13px] text-muted">{t('search.noResults', { query })}</p>
		{:else}
			{#if listResults.length}
				<p class="section-label px-3 pt-2 pb-1">{t('search.lists')}</p>
				{#each listResults as list (list.id)}
					<button
						type="button"
						onclick={() => openList(list.id)}
						class="flex w-full items-center gap-3 rounded-[12px] px-3 py-2.5 text-left text-sm text-fg-2 hover:bg-surface-2 hover:text-fg"
					>
						<span class="h-3 w-3 rounded-full" style={`background:${listColorValue(list.color)}`}
						></span>
						{list.name}
					</button>
				{/each}
			{/if}
			{#if taskResults.length}
				<p class="section-label px-3 pt-3 pb-1">{t('search.tasks')}</p>
				{#each taskResults as task (task.id)}
					<button
						type="button"
						onclick={() => {
							close();
							ui.openEditTask(task);
						}}
						class="flex w-full items-center gap-3 rounded-[12px] px-3 py-2.5 text-left text-sm hover:bg-surface-2"
					>
						<Icon
							name={task.completed ? 'checkCircle' : 'square'}
							size={15}
							class={task.completed ? 'text-accent-text' : 'text-muted'}
						/>
						<span
							class={`flex-1 truncate ${task.completed ? 'text-muted line-through' : 'text-fg-2'}`}
						>
							{task.title}
						</span>
						{#if task.listId}
							{@const list = lists.byId(task.listId)}
							{#if list}
								<span class="text-[11px] text-muted">{list.name}</span>
							{/if}
						{/if}
					</button>
				{/each}
			{/if}
		{/if}
	</div>
</dialog>
