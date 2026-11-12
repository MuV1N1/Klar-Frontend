<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';

	import Icon from './Icon.svelte';
	import type { IconName } from './icons.ts';

	interface Props extends HTMLButtonAttributes {
		icon: IconName;
		label: string;
		size?: 'sm' | 'md' | 'lg';
		variant?: 'ghost' | 'surface' | 'danger';
	}

	let {
		icon,
		label,
		size = 'md',
		variant = 'ghost',
		class: className = '',
		type = 'button',
		...rest
	}: Props = $props();

	const sizes = {
		sm: 'h-8 w-8 rounded-[10px]',
		md: 'h-10 w-10 rounded-[12px]',
		lg: 'h-12 w-12 rounded-full'
	};
	const variants = {
		ghost: 'text-muted hover:bg-surface-2 hover:text-fg',
		surface: 'bg-surface-3 text-fg-2 hover:bg-border hover:text-fg',
		danger: 'text-muted hover:bg-danger/10 hover:text-danger-text'
	};
	const iconSize = $derived(size === 'sm' ? 15 : 18);
</script>

<button
	{type}
	aria-label={label}
	title={label}
	class={`inline-flex shrink-0 items-center justify-center transition-colors duration-150 active:scale-95 disabled:pointer-events-none disabled:opacity-50 ${sizes[size]} ${variants[variant]} ${className}`}
	{...rest}
>
	<Icon name={icon} size={iconSize} />
</button>
