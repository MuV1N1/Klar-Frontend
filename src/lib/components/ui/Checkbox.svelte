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

	const dimension = $derived(size === 'sm' ? 'h-5 w-5' : 'h-7 w-7 sm:h-8 sm:w-8');
</script>

<!-- Circle checkbox from the Figma task row: ring in the list colour, filled lime when done -->
<button
	type="button"
	role="checkbox"
	aria-checked={checked}
	aria-label={label}
	{disabled}
	onclick={(event) => {
		event.stopPropagation();
		onchange(!checked);
	}}
	class={`group/check relative inline-flex shrink-0 items-center justify-center rounded-full border-[2.5px] transition-all duration-150 active:scale-90 disabled:opacity-50 ${dimension} ${
		checked ? 'border-accent-line bg-accent' : 'bg-transparent hover:bg-surface-3'
	}`}
	style={checked ? '' : `border-color: ${color ?? 'var(--border-strong)'}`}
>
	<Icon
		name="check"
		size={size === 'sm' ? 11 : 15}
		strokeWidth={3}
		class={`text-accent-fg transition-opacity duration-150 ${checked ? 'opacity-100' : 'opacity-0 group-hover/check:opacity-40'}`}
	/>
</button>
