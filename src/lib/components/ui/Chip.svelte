<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		/** Hex colour used for text; background is derived with color-mix. */
		color?: string;
		size?: 'sm' | 'md';
		dot?: boolean;
		class?: string;
		children: Snippet;
	}

	let {
		color = 'var(--list-gray)',
		size = 'md',
		dot = false,
		class: className = '',
		children
	}: Props = $props();
</script>

<span
	class={`inline-flex shrink-0 items-center gap-1.5 rounded-full font-medium whitespace-nowrap ${
		size === 'sm' ? 'h-6 px-2.5 text-[11px]' : 'h-8 px-3.5 text-[12px]'
	} ${className}`}
	style={`color: ${color}; background: color-mix(in srgb, ${color} 14%, transparent);`}
>
	{#if dot}<span class="h-1.5 w-1.5 rounded-full" style={`background:${color}`}></span>{/if}
	{@render children()}
</span>
