<script lang="ts">
	interface Props {
		value: number;
		max: number;
		label?: string;
		class?: string;
	}

	let { value, max, label, class: className = '' }: Props = $props();

	const percent = $derived(max > 0 ? Math.round((Math.min(value, max) / max) * 100) : 0);
</script>

<div
	role="progressbar"
	aria-valuemin={0}
	aria-valuemax={max}
	aria-valuenow={value}
	aria-label={label}
	class={`h-3 w-full overflow-hidden rounded-full bg-track ${className}`}
>
	<div
		class="h-full rounded-full bg-accent shadow-[inset_0_0_0_1px_var(--accent-line)] transition-[width] duration-500 ease-out"
		style={`width: ${percent}%`}
	></div>
</div>
