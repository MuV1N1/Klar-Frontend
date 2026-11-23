<script lang="ts" module>
	import { LIST_COLORS, colorValue } from '#lib/types/index.ts';

	const PERSON_COLORS = LIST_COLORS.filter((color) => color !== 'gray');

	/** The same person always gets the same colour, in every group and on every device. */
	export function personColor(id: string): string {
		let hash = 0;
		for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) | 0;
		return colorValue(PERSON_COLORS[Math.abs(hash) % PERSON_COLORS.length]);
	}

	export function initials(name: string): string {
		return name
			.split(/\s+/)
			.filter(Boolean)
			.slice(0, 2)
			.map((part) => part[0]?.toUpperCase())
			.join('');
	}
</script>

<script lang="ts">
	interface Props {
		id: string;
		name: string;
		size?: number;
		/** Accessible label; without one the avatar is decorative. */
		label?: string;
		class?: string;
	}

	let { id, name, size = 32, label, class: className = '' }: Props = $props();
</script>

<span
	class={`fill-card inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-fg shadow-none! ${className}`}
	style={`--c:${personColor(id)};width:${size}px;height:${size}px;font-size:${Math.round(size * 0.4)}px`}
	role={label ? 'img' : undefined}
	aria-label={label}
	aria-hidden={label ? undefined : 'true'}
	title={label}
>
	{initials(name)}
</span>
