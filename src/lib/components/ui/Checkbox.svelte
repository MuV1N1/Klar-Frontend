<script lang="ts">
	import Icon from './Icon.svelte';

	interface Props {
		checked: boolean;
		label: string;
		color?: string | null;
		size?: 'sm' | 'md';
		disabled?: boolean;
		/** Fill when checked, usually the task's list colour; light blue without one. */
		fill?: string | null;
		onchange: (checked: boolean) => void;
	}

	let {
		checked,
		label,
		color = null,
		fill = null,
		size = 'md',
		disabled = false,
		onchange
	}: Props = $props();

	const dimension = $derived(
		size === 'sm' ? 'h-[18px] w-[18px]' : 'h-6 w-6 sm:h-[22px] sm:w-[22px]'
	);
	// Invisible hit area around the small circle: at least 44px to tap, layout unchanged
	const hitArea = $derived(size === 'sm' ? 'before:-inset-[13px]' : 'before:-inset-[11px]');

	// Only pop when the user ticks it, not when a done task renders
	let popped = $state(false);
</script>

<!-- Circle checkbox: neutral ring (red for high priority), filled with the list colour when done -->
<button
	type="button"
	role="checkbox"
	aria-checked={checked}
	aria-label={label}
	{disabled}
	onclick={(event) => {
		event.stopPropagation();
		popped = !checked;
		onchange(!checked);
	}}
	class={`group/check relative inline-flex shrink-0 items-center justify-center rounded-full border-2 transition-[background-color,border-color] duration-150 before:absolute before:rounded-full before:content-[''] disabled:opacity-50 ${dimension} ${hitArea} ${
		checked ? (popped ? 'animate-check-pop' : '') : 'bg-transparent hover:bg-accent-soft'
	}`}
	style={checked
		? `background:${fill ?? 'var(--accent)'};border-color:${fill ?? 'var(--accent)'}`
		: `border-color: ${color ?? 'var(--border-strong)'}`}
>
	<Icon
		name="check"
		size={size === 'sm' ? 10 : 13}
		strokeWidth={3.2}
		class={`transition-opacity duration-150 ${fill ? 'text-surface' : 'text-accent-fg'} ${checked ? 'opacity-100' : 'opacity-0 group-hover/check:opacity-40'}`}
	/>
</button>
