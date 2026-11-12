<script lang="ts">
	interface Props {
		checked: boolean;
		label: string;
		description?: string;
		onchange?: (checked: boolean) => void;
	}

	let { checked = $bindable(false), label, description, onchange }: Props = $props();

	function toggle() {
		checked = !checked;
		onchange?.(checked);
	}
</script>

<button
	type="button"
	role="switch"
	aria-checked={checked}
	onclick={toggle}
	class="flex w-full items-center justify-between gap-4 rounded-[12px] px-1 py-2 text-left transition-colors hover:bg-surface-2"
>
	<span class="flex flex-col gap-0.5">
		<span class="text-sm font-medium text-fg">{label}</span>
		{#if description}<span class="text-[12px] text-muted">{description}</span>{/if}
	</span>
	<span
		class={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ${
			checked ? 'bg-accent shadow-[inset_0_0_0_1px_var(--accent-line)]' : 'bg-track'
		}`}
	>
		<span
			class={`absolute left-0.5 h-5 w-5 rounded-full shadow transition-transform duration-200 ${
				checked ? 'translate-x-5 bg-accent-fg' : 'translate-x-0 bg-white'
			}`}
		></span>
	</span>
</button>
