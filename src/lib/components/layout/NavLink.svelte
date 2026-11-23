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

<!-- Sidebar nav item: compact row, active = light-blue pill on its own edge -->
<a
	{href}
	{onclick}
	aria-current={active ? 'page' : undefined}
	use:dropTarget={drop}
	class={`flex h-9 items-center gap-2.5 rounded-[10px] px-2.5 text-[14px] font-medium transition-colors duration-150 data-[drop=over]:bg-accent-soft data-[drop=over]:ring-2 data-[drop=over]:ring-accent-line data-[drop=ready]:ring-1 data-[drop=ready]:ring-border-strong ${
		active
			? 'bg-accent text-accent-fg shadow-[0_2px_0_color-mix(in_srgb,var(--accent)_55%,#0b2b4a)]'
			: 'text-fg-2 hover:bg-surface-3 dark:hover:bg-surface-2'
	}`}
>
	{#if color}
		<span class="mx-0.5 h-3 w-3 shrink-0 rounded-[4px]" style={`background:${color}`}></span>
	{:else if icon}
		<Icon name={icon} size={16} class={active ? 'text-accent-fg' : 'text-muted'} />
	{/if}
	<span class="min-w-0 flex-1 truncate">{label}</span>
	{#if count !== undefined && count > 0}
		<span
			class={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[12px] tabular-nums ${
				active ? 'font-semibold text-accent-fg' : 'font-medium text-muted'
			}`}
		>
			{count}
		</span>
	{/if}
</a>
