<script lang="ts">
	import Icon from './Icon.svelte';

	interface Props {
		checked: boolean;
		label: string;
		color?: string | null;
		size?: 'sm' | 'md';
		disabled?: boolean;
		onchange: (checked: boolean) => void;
	}

	let { checked, label, color = null, size = 'md', disabled = false, onchange }: Props = $props();

	const dimension = $derived(
		size === 'sm' ? 'h-[18px] w-[18px]' : 'h-6 w-6 sm:h-[22px] sm:w-[22px]'
	);

	// Only pop when the user ticks it, not when a done task renders
	let popped = $state(false);
</script>

<!-- Circle checkbox: neutral ring (red for high priority), filled accent when done -->
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
	class={`group/check relative inline-flex shrink-0 items-center justify-center rounded-full border-[1.5px] transition-all duration-150 active:scale-90 disabled:opacity-50 ${dimension} ${
		checked
			? `border-accent-line bg-accent ${popped ? 'animate-check-pop' : ''}`
			: 'bg-transparent hover:border-accent-line hover:bg-accent-soft'
	}`}
	style={checked ? '' : `border-color: ${color ?? 'var(--border-strong)'}`}
>
	<Icon
		name="check"
		size={size === 'sm' ? 10 : 13}
		strokeWidth={3.2}
		class={`text-accent-fg transition-opacity duration-150 ${checked ? 'opacity-100' : 'opacity-0 group-hover/check:opacity-40'}`}
	/>
</button>
