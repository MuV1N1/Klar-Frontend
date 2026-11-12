<script module lang="ts">
	import type { IconName } from './icons.ts';

	export interface MenuItem {
		id: string;
		label: string;
		icon?: IconName;
		danger?: boolean;
		disabled?: boolean;
		onSelect: () => void;
	}
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';

	import Icon from './Icon.svelte';

	interface Props {
		items: MenuItem[];
		align?: 'left' | 'right';
		label: string;
		/** The trigger element. Receives `open`. */
		trigger: Snippet<[boolean]>;
	}

	let { items, align = 'right', label, trigger }: Props = $props();

	let open = $state(false);
	let root = $state<HTMLDivElement | null>(null);

	function toggle(event: MouseEvent) {
		event.stopPropagation();
		open = !open;
	}

	function select(item: MenuItem) {
		if (item.disabled) return;
		open = false;
		item.onSelect();
	}

	$effect(() => {
		if (!open) return;
		const onDocClick = (event: MouseEvent) => {
			if (root && !root.contains(event.target as Node)) open = false;
		};
		const onKey = (event: KeyboardEvent) => {
			if (event.key === 'Escape') open = false;
		};
		document.addEventListener('click', onDocClick);
		document.addEventListener('keydown', onKey);
		return () => {
			document.removeEventListener('click', onDocClick);
			document.removeEventListener('keydown', onKey);
		};
	});
</script>

<div bind:this={root} class="relative inline-flex">
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div
		onclick={toggle}
		aria-haspopup="menu"
		aria-expanded={open}
		aria-label={label}
		class="contents"
	>
		{@render trigger(open)}
	</div>

	{#if open}
		<div
			role="menu"
			class={`absolute top-[calc(100%+6px)] z-30 min-w-[190px] animate-pop-in rounded-[14px] border border-border bg-surface p-1.5 shadow-xl ${align === 'right' ? 'right-0' : 'left-0'}`}
		>
			{#each items as item (item.id)}
				<button
					type="button"
					role="menuitem"
					disabled={item.disabled}
					onclick={(event) => {
						event.stopPropagation();
						select(item);
					}}
					class={`flex w-full items-center gap-2.5 rounded-[10px] px-3 py-2 text-left text-[13px] transition-colors disabled:opacity-40 ${
						item.danger
							? 'text-danger-text hover:bg-danger/10'
							: 'text-fg-2 hover:bg-surface-2 hover:text-fg'
					}`}
				>
					{#if item.icon}<Icon name={item.icon} size={15} />{/if}
					{item.label}
				</button>
			{/each}
		</div>
	{/if}
</div>
