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
			class="flex items-center gap-3 text-[26px] leading-tight font-semibold tracking-tight text-fg sm:text-[30px]"
		>
			{#if titleAccent}
				<span class="h-3.5 w-3.5 shrink-0 rounded-full" style={`background:${titleAccent}`}></span>
			{/if}
			<span class="truncate">{title}</span>
		</h1>
		{#if description}<p class="text-sm text-muted">{description}</p>{/if}
	</div>
	{#if actions}<div class="flex shrink-0 items-center gap-2">{@render actions()}</div>{/if}
</header>
