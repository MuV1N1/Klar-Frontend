<script lang="ts">
	interface Props {
		size?: number;
		showWordmark?: boolean;
		class?: string;
	}

	let { size = 42, showWordmark = true, class: className = '' }: Props = $props();
</script>

<span class={`inline-flex items-center gap-3 ${className}`}>
	<svg
		width={size}
		height={size}
		viewBox="0 0 64 64"
		aria-hidden="true"
		class="shrink-0"
		style={`border-radius: ${Math.round(size * 0.26)}px`}
	>
		<rect width="64" height="64" rx="16" fill="#C7FF35" />
		<path
			d="M18 33.5 27.5 43 46 23"
			fill="none"
			stroke="#101114"
			stroke-width="7"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
	</svg>
	{#if showWordmark}
		<span class="text-[15px] font-semibold tracking-tight text-fg">Klar.</span>
	{/if}
</span>
