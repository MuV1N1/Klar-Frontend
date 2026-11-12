<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		label: string;
		for?: string;
		hint?: string;
		error?: string | null;
		class?: string;
		children: Snippet;
	}

	let {
		label,
		for: htmlFor,
		hint,
		error = null,
		class: className = '',
		children
	}: Props = $props();
</script>

<div class={`flex flex-col gap-2 ${className}`}>
	<label for={htmlFor} class="section-label">{label}</label>
	{@render children()}
	{#if error}
		<p class="text-[12px] text-danger-text" role="alert">{error}</p>
	{:else if hint}
		<p class="text-[12px] text-muted">{hint}</p>
	{/if}
</div>
