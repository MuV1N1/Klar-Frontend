<script lang="ts">
	import type { HTMLSelectAttributes } from 'svelte/elements';

	import Icon from './Icon.svelte';

	interface Option {
		value: string;
		label: string;
	}

	interface Props extends Omit<HTMLSelectAttributes, 'size'> {
		value?: string;
		options: Option[];
		size?: 'sm' | 'md';
	}

	let {
		value = $bindable(''),
		options,
		size = 'md',
		class: className = '',
		...rest
	}: Props = $props();
</script>

<div class={`relative ${className}`}>
	<select
		bind:value
		class={`w-full appearance-none rounded-[12px] border border-transparent bg-surface-2 pr-10 pl-4 text-fg transition-[border-color,box-shadow] duration-150 focus:border-border-strong focus:ring-2 focus:ring-ring focus:outline-none ${
			size === 'sm' ? 'h-9 text-[13px]' : 'h-11 text-sm'
		}`}
		{...rest}
	>
		{#each options as option (option.value)}
			<option value={option.value}>{option.label}</option>
		{/each}
	</select>
	<Icon
		name="chevronDown"
		size={16}
		class="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-muted"
	/>
</div>
