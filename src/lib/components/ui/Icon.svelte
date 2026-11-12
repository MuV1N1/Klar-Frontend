<script lang="ts">
	import { ICONS, type IconName } from './icons.ts';

	interface Props {
		name: IconName;
		size?: number;
		strokeWidth?: number;
		class?: string;
	}

	let { name, size = 18, strokeWidth = 2, class: className = '' }: Props = $props();
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width={strokeWidth}
	stroke-linecap="round"
	stroke-linejoin="round"
	aria-hidden="true"
	class={`shrink-0 ${className}`}
>
	<path d={ICONS[name]} />
</svg>
