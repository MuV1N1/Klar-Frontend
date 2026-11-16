<script lang="ts">
	import { dropTarget, type DropTarget } from '#lib/stores/drag.svelte.ts';

	import Icon from '../ui/Icon.svelte';
	import type { IconName } from '../ui/icons.ts';

	interface Props {
		href: string;
		label: string;
		icon?: IconName;
		color?: string | null;
		active?: boolean;
		count?: number;
		onclick?: () => void;
		/** Accept dragged items (e.g. tasks dropped onto a list). */
		drop?: DropTarget;
	}

	let {
		href,
		label,
		icon,
		color = null,
		active = false,
		count,
		onclick,
		drop = { accepts: () => false, ondrop: () => undefined }
	}: Props = $props();
</script>

<!-- Sidebar nav item (Figma: 54px tall rounded row, active = raised surface, lime count badge) -->
<a
	{href}
	{onclick}
	aria-current={active ? 'page' : undefined}
	use:dropTarget={drop}
	class={`flex h-11 items-center gap-3 rounded-[12px] px-3 text-[13.5px] transition-colors duration-150 data-[drop=over]:bg-accent-soft data-[drop=over]:ring-2 data-[drop=over]:ring-accent-line data-[drop=ready]:ring-1 data-[drop=ready]:ring-border-strong ${
		active ? 'bg-surface-3 font-medium text-fg' : 'text-fg-2 hover:bg-surface-2 hover:text-fg'
	}`}
>
	{#if color}
		<span class="ml-0.5 h-3.5 w-3.5 shrink-0 rounded-full" style={`background:${color}`}></span>
	{:else if icon}
		<Icon name={icon} size={16} class={active ? 'text-fg' : 'text-muted'} />
	{/if}
	<span class="min-w-0 flex-1 truncate">{label}</span>
	{#if count !== undefined && count > 0}
		<span
			class={`flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-[12px] font-semibold ${
				active
					? 'bg-accent text-accent-fg shadow-[inset_0_0_0_1px_var(--accent-line)]'
					: 'bg-surface-3 text-muted'
			}`}
		>
			{count}
		</span>
	{/if}
</a>
