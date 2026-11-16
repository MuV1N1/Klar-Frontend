<script lang="ts">
	import { useTranslations } from '#lib/i18n/index.ts';
	import {
		LIST_COLORS,
		LIST_COLOR_VALUES,
		isPresetColor,
		type ListColor
	} from '#lib/types/index.ts';

	import Icon from './Icon.svelte';

	interface Props {
		value: ListColor;
		label: string;
	}

	let { value = $bindable('gray'), label }: Props = $props();

	const t = useTranslations();

	const custom = $derived(!isPresetColor(value));
	/** Last custom colour, so switching back and forth between presets keeps it. */
	let lastCustom = $state<string>('#4f8cff');
	$effect(() => {
		if (!isPresetColor(value)) lastCustom = value;
	});

	const swatch =
		'relative flex h-8 w-8 items-center justify-center rounded-full transition-transform hover:scale-110';
	const selected = 'ring-2 ring-fg ring-offset-2 ring-offset-surface';
</script>

<div class="flex flex-wrap items-center gap-2.5" role="radiogroup" aria-label={label}>
	{#each LIST_COLORS as option (option)}
		<button
			type="button"
			role="radio"
			aria-checked={value === option}
			aria-label={t(`lists.colors.${option}`)}
			title={t(`lists.colors.${option}`)}
			onclick={() => (value = option)}
			class={`${swatch} ${value === option ? selected : ''}`}
			style={`background:${LIST_COLOR_VALUES[option]}`}
		>
			{#if value === option}<Icon
					name="check"
					size={13}
					strokeWidth={3}
					class="text-white dark:text-[#101114]"
				/>{/if}
		</button>
	{/each}

	<!-- Free colour: the native picker opens when the swatch is clicked -->
	<label
		class={`${swatch} cursor-pointer ${custom ? selected : ''}`}
		title={t('colors.custom')}
		style={custom
			? `background:${value}`
			: 'background:conic-gradient(#ff5f5f,#ffd23f,#5fe07a,#4fc3ff,#8f6bff,#ff5fc8,#ff5f5f)'}
	>
		<span class="sr-only">{t('colors.custom')}</span>
		{#if custom}
			<Icon name="check" size={13} strokeWidth={3} class="text-white mix-blend-difference" />
		{:else}
			<Icon name="plus" size={13} strokeWidth={3} class="text-white drop-shadow" />
		{/if}
		<input
			type="color"
			class="absolute inset-0 h-full w-full cursor-pointer opacity-0"
			value={custom ? value : lastCustom}
			role="radio"
			aria-checked={custom}
			aria-label={t('colors.custom')}
			oninput={(e) => (value = e.currentTarget.value.toLowerCase() as ListColor)}
		/>
	</label>
</div>
