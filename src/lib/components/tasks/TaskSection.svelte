<script lang="ts">
	import type { Snippet } from 'svelte';
	import { flip } from 'svelte/animate';
	import { prefersReducedMotion } from 'svelte/motion';
	import { fly, slide } from 'svelte/transition';

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

	const motion = $derived(prefersReducedMotion.current ? 0 : 1);
</script>

<section class="flex animate-rise-in flex-col gap-1.5">
	<div class="flex items-center justify-between gap-3">
		<h2 class="section-label flex items-baseline gap-2 px-3">
			{label}
			{#if count !== undefined}<span class="font-medium text-muted tabular-nums">{count}</span>{/if}
		</h2>
		{#if action}{@render action()}{/if}
	</div>

	{#if tasks.length === 0}
		{#if empty}{@render empty()}{/if}
	{:else if variant === 'completed'}
		<div class="flex flex-col gap-0.5">
			{#each tasks as task (task.id)}
				<div
					animate:flip={{ duration: 260 * motion }}
					in:fly={{ y: -8, duration: 280 * motion }}
					out:slide={{ duration: 220 * motion }}
				>
					<CompletedTaskLine {task} />
				</div>
			{/each}
		</div>
	{:else}
		<div class="flex flex-col divide-y divide-line">
			{#each tasks as task, index (task.id)}
				<div
					animate:flip={{ duration: 260 * motion }}
					in:fly={{ y: -8, duration: 280 * motion }}
					out:slide={{ duration: 220 * motion }}
				>
					<TaskItem {task} {hideList} {hideDate} highlight={highlightFirst && index === 0} />
				</div>
			{/each}
		</div>
	{/if}
</section>
