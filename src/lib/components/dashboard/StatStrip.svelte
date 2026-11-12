<script lang="ts">
	interface Stat {
		label: string;
		value: number;
		tone?: 'default' | 'danger';
		href?: string;
	}

	let { stats }: { stats: Stat[] } = $props();
</script>

<!-- One quiet row of numbers instead of four separate cards -->
<dl
	class="grid grid-cols-2 gap-px overflow-hidden rounded-[18px] border border-border bg-border lg:grid-cols-4"
>
	{#each stats as stat (stat.label)}
		<svelte:element
			this={stat.href ? 'a' : 'div'}
			href={stat.href}
			class={`flex flex-col gap-1 bg-surface px-5 py-4 ${stat.href ? 'transition-colors hover:bg-surface-2' : ''}`}
		>
			<dt class="order-2 truncate text-[12px] text-muted">{stat.label}</dt>
			<dd
				class={`order-1 text-[24px] leading-none font-semibold tracking-tight tabular-nums ${
					stat.tone === 'danger' ? 'text-danger-text' : 'text-fg'
				}`}
			>
				{stat.value}
			</dd>
		</svelte:element>
	{/each}
</dl>
