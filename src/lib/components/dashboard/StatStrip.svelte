<script lang="ts">
	interface Stat {
		label: string;
		value: number;
		tone?: 'default' | 'danger';
		href?: string;
		/** Colour of the tile, a list colour value. */
		color: string;
	}

	let { stats }: { stats: Stat[] } = $props();
</script>

<!-- Numbers as soft colour tiles; overdue only turns red when there is something overdue -->
<dl class="grid grid-cols-2 gap-3 lg:grid-cols-4">
	{#each stats as stat (stat.label)}
		<svelte:element
			this={stat.href ? 'a' : 'div'}
			href={stat.href}
			style={`--c:${stat.color}`}
			class={`fill-card flex flex-col gap-1 rounded-[20px] px-5 py-4 ${stat.href ? 'pressable hover:brightness-[0.98]' : ''}`}
		>
			<dt
				class={`order-2 truncate text-[13px] font-medium ${stat.tone === 'danger' ? 'text-danger-text' : 'text-fg-2'}`}
			>
				{stat.label}
			</dt>
			<dd
				class={`order-1 font-display text-[40px] leading-[44px] font-bold tracking-tight tabular-nums ${
					stat.tone === 'danger' ? 'text-danger-text' : 'text-fg'
				}`}
			>
				{stat.value}
			</dd>
		</svelte:element>
	{/each}
</dl>
