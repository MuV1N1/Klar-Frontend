<script lang="ts">
	interface Stat {
		label: string;
		value: number;
		tone?: 'default' | 'danger';
		href?: string;
	}

	let { stats }: { stats: Stat[] } = $props();
</script>

<!-- One hairline strip of numbers: no boxes, overdue only in red -->
<dl class="grid grid-cols-2 border-y border-line lg:grid-cols-4">
	{#each stats as stat, index (stat.label)}
		<svelte:element
			this={stat.href ? 'a' : 'div'}
			href={stat.href}
			class={`flex items-baseline gap-2.5 py-3.5 ${index > 0 ? 'lg:border-l lg:border-line lg:pl-6' : ''} ${
				index % 2 === 1 ? 'max-lg:border-l max-lg:border-line max-lg:pl-5' : ''
			} ${stat.href ? 'transition-opacity hover:opacity-70' : ''}`}
		>
			<dt
				class={`order-2 truncate text-[13px] ${stat.tone === 'danger' ? 'text-danger-text' : 'text-muted'}`}
			>
				{stat.label}
			</dt>
			<dd
				class={`order-1 text-[26px] leading-none font-semibold tracking-tight tabular-nums ${
					stat.tone === 'danger' ? 'text-danger-text' : 'text-fg'
				}`}
			>
				{stat.value}
			</dd>
		</svelte:element>
	{/each}
</dl>
