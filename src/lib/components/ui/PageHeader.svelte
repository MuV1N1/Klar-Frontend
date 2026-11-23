<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		eyebrow?: string;
		title: string;
		description?: string;
		actions?: Snippet;
		titleAccent?: string | null;
	}

	let { eyebrow, title, description, actions, titleAccent = null }: Props = $props();
</script>

<header class="mb-8 flex animate-fade-in flex-wrap items-start justify-between gap-4">
	<div class="flex min-w-0 flex-col gap-2">
		{#if eyebrow}<p class="text-[13px] text-muted">{eyebrow}</p>{/if}
		<h1
			class="flex items-center gap-3 font-display text-[30px] leading-[1.1] font-bold tracking-[-0.025em] text-fg sm:text-[38px]"
		>
			{#if titleAccent}
				<span class="h-4 w-4 shrink-0 rounded-[5px]" style={`background:${titleAccent}`}></span>
			{/if}
			<span class="truncate">{title}</span>
		</h1>
		{#if description}<p class="max-w-xl text-[15px] text-fg-2">{description}</p>{/if}
	</div>
	{#if actions}<div class="flex shrink-0 items-center gap-2">{@render actions()}</div>{/if}
</header>
