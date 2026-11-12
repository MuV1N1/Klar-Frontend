<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLInputAttributes, 'size'> {
		value?: string;
		invalid?: boolean;
		size?: 'md' | 'lg';
		ref?: HTMLInputElement | null;
	}

	let {
		value = $bindable(''),
		invalid = false,
		size = 'md',
		class: className = '',
		ref = $bindable(null),
		...rest
	}: Props = $props();
</script>

<input
	bind:this={ref}
	bind:value
	aria-invalid={invalid || undefined}
	class={`w-full rounded-[12px] border bg-surface-2 px-4 text-fg transition-[border-color,box-shadow] duration-150 placeholder:text-muted focus:border-border-strong focus:ring-2 focus:ring-ring focus:outline-none ${
		size === 'lg' ? 'h-14 text-[15px]' : 'h-11 text-sm'
	} ${invalid ? 'border-danger' : 'border-transparent'} ${className}`}
	{...rest}
/>
