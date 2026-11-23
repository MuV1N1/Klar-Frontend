<script lang="ts">
	interface Props {
		size?: number;
		showWordmark?: boolean;
		class?: string;
	}

	let { size = 42, showWordmark = true, class: className = '' }: Props = $props();
</script>

<span class={`inline-flex items-center gap-2.5 ${className}`}>
	<svg
		width={size}
		height={size}
		viewBox="0 0 64 64"
		aria-hidden="true"
		class="shrink-0"
		style={`border-radius: ${Math.round(size * 0.26)}px`}
	>
		<rect width="64" height="64" rx="16" fill="var(--accent)" />
		<path
			d="M18 33.5 27.5 43 46 23"
			fill="none"
			stroke="var(--accent-fg)"
			stroke-width="7"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
	</svg>
	{#if showWordmark}
		<!-- Inherits the text colour, so it works on the page and on the dark hero -->
		<span class="font-display text-[20px] font-bold tracking-tight">Klar</span>
	{/if}
</span>
