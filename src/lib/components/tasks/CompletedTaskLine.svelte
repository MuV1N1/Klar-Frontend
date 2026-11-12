<script lang="ts">
	import { useTranslations } from '#lib/i18n/index.ts';
	import { tasks } from '#lib/stores/tasks.svelte.ts';
	import { toasts } from '#lib/stores/toasts.svelte.ts';
	import { ui } from '#lib/stores/ui.svelte.ts';
	import type { Task } from '#lib/types/index.ts';

	import Icon from '../ui/Icon.svelte';
	import IconButton from '../ui/IconButton.svelte';

	let { task }: { task: Task } = $props();

	const t = useTranslations();

	async function reopen() {
		try {
			await tasks.setCompleted(task.id, false);
			toasts.success(t('tasks.reopened', { title: task.title }));
		} catch {
			toasts.error(t('common.errorGeneric'));
		}
	}
</script>

<!-- Figma: completed tasks are quiet single lines with a check mark -->
<div
	class="group flex items-center gap-3 rounded-[12px] px-2 py-2 transition-colors hover:bg-surface-2 sm:px-3"
>
	<button
		type="button"
		aria-label={t('tasks.markOpen')}
		onclick={reopen}
		class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-accent-text transition-colors group-hover:bg-accent-soft"
	>
		<Icon name="check" size={13} strokeWidth={2.5} />
	</button>
	<button
		type="button"
		class="min-w-0 flex-1 truncate text-left text-[13px] text-muted line-through decoration-muted/50 hover:text-fg-2"
		onclick={() => ui.openEditTask(task)}
	>
		{task.title}
	</button>
	<IconButton
		icon="rotate"
		label={t('tasks.markOpen')}
		size="sm"
		class="sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
		onclick={reopen}
	/>
</div>
