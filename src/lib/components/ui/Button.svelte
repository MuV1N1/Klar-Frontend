<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	import Icon from './Icon.svelte';
	import type { IconName } from './icons.ts';
	import Spinner from './Spinner.svelte';

	type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
	type Size = 'sm' | 'md' | 'lg';

	interface Props extends HTMLButtonAttributes {
		variant?: Variant;
		size?: Size;
		icon?: IconName;
		iconRight?: IconName;
		loading?: boolean;
		block?: boolean;
		href?: string;
		children?: Snippet;
	}

	let {
		variant = 'secondary',
		size = 'md',
		icon,
		iconRight,
		loading = false,
		block = false,
		href,
		disabled,
		class: className = '',
		children,
		type = 'button',
		...rest
	}: Props = $props();

	const variants: Record<Variant, string> = {
		primary:
			'bg-accent text-accent-fg hover:brightness-95 active:brightness-90 shadow-[inset_0_0_0_1px_var(--accent-line)]',
		secondary: 'bg-surface-3 text-fg hover:bg-border active:brightness-95',
		outline: 'border border-border bg-transparent text-fg hover:bg-surface-2',
		ghost: 'bg-transparent text-fg-2 hover:bg-surface-2 hover:text-fg',
		danger: 'bg-transparent text-danger-text hover:bg-danger/10'
	};

	const sizes: Record<Size, string> = {
		sm: 'h-8 px-3 text-[13px] gap-1.5 rounded-[10px]',
		md: 'h-10 px-4 text-sm gap-2 rounded-[12px]',
		lg: 'h-12 px-6 text-[15px] gap-2 rounded-[14px]'
	};

	const iconSize = $derived(size === 'sm' ? 14 : size === 'lg' ? 18 : 16);

	const classes = $derived(
		[
			'inline-flex items-center justify-center font-medium whitespace-nowrap select-none transition-[background-color,color,filter,transform] duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50',
			variants[variant],
			sizes[size],
			block ? 'w-full' : '',
			className
		].join(' ')
	);
</script>

{#if href}
	<a {href} class={classes} aria-disabled={disabled || loading}>
		{#if icon}<Icon name={icon} size={iconSize} />{/if}
		{@render children?.()}
		{#if iconRight}<Icon name={iconRight} size={iconSize} />{/if}
	</a>
{:else}
	<button {type} class={classes} disabled={disabled || loading} {...rest}>
		{#if loading}
			<Spinner size={iconSize} />
		{:else if icon}
			<Icon name={icon} size={iconSize} />
		{/if}
		{@render children?.()}
		{#if iconRight && !loading}<Icon name={iconRight} size={iconSize} />{/if}
	</button>
{/if}
