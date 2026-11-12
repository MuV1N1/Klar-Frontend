<script lang="ts">
	import type { HTMLTextareaAttributes } from 'svelte/elements';

	interface Props extends HTMLTextareaAttributes {
		value?: string;
	}

	let { value = $bindable(''), class: className = '', rows = 3, ...rest }: Props = $props();
</script>

<textarea
	bind:value
	{rows}
	class={`w-full resize-y rounded-[12px] border border-transparent bg-surface-2 px-4 py-3 text-sm text-fg transition-[border-color,box-shadow] duration-150 placeholder:text-muted focus:border-border-strong focus:ring-2 focus:ring-ring focus:outline-none ${className}`}
	{...rest}></textarea>
