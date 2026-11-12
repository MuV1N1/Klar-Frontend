<script lang="ts">
	import type { Snippet } from 'svelte';

	import Icon from './Icon.svelte';
	import type { IconName } from './icons.ts';

	interface Props {
		icon?: IconName;
		title: string;
		description?: string;
		compact?: boolean;
		children?: Snippet;
	}

	let { icon = 'checkCircle', title, description, compact = false, children }: Props = $props();
</script>

<div
	class={`flex flex-col items-center justify-center rounded-[18px] border border-dashed border-border text-center ${compact ? 'gap-2 px-4 py-8' : 'gap-3 px-6 py-14'}`}
>
	<span
		class="flex h-11 w-11 items-center justify-center rounded-full bg-surface-2 text-muted"
		aria-hidden="true"
	>
		<Icon name={icon} size={20} />
	</span>
	<p class="text-sm font-medium text-fg">{title}</p>
	{#if description}<p class="max-w-xs text-[13px] text-muted">{description}</p>{/if}
	{#if children}<div class="mt-2">{@render children()}</div>{/if}
</div>
