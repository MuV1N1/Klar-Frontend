<script lang="ts">
	import type { Snippet } from 'svelte';

	import type { Task } from '#lib/types/index.ts';

	import CompletedTaskLine from './CompletedTaskLine.svelte';
	import TaskItem from './TaskItem.svelte';

	interface Props {
		label: string;
		tasks: Task[];
		count?: number;
		variant?: 'cards' | 'completed';
		hideList?: boolean;
		hideDate?: boolean;
		highlightFirst?: boolean;
		action?: Snippet;
		empty?: Snippet;
	}

	let {
		label,
		tasks,
		count,
		variant = 'cards',
		hideList = false,
		hideDate = false,
		highlightFirst = false,
		action,
		empty
	}: Props = $props();
</script>

<section class="flex animate-rise-in flex-col gap-4">
	<div class="flex items-center justify-between gap-3">
		<h2 class="section-label">
			{count !== undefined ? `${label} · ${count}` : label}
		</h2>
		{#if action}{@render action()}{/if}
	</div>

	{#if tasks.length === 0}
		{#if empty}{@render empty()}{/if}
	{:else if variant === 'completed'}
		<div class="flex flex-col gap-0.5">
			{#each tasks as task (task.id)}
				<CompletedTaskLine {task} />
			{/each}
		</div>
	{:else}
		<div class="flex flex-col gap-3">
			{#each tasks as task, index (task.id)}
				<TaskItem {task} {hideList} {hideDate} highlight={highlightFirst && index === 0} />
			{/each}
		</div>
	{/if}
</section>
