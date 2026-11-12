<script lang="ts">
	import type { Snippet } from 'svelte';

	import IconButton from './IconButton.svelte';

	interface Props {
		open: boolean;
		title: string;
		closeLabel?: string;
		size?: 'sm' | 'md' | 'lg';
		onclose: () => void;
		children: Snippet;
		footer?: Snippet;
	}

	let {
		open,
		title,
		closeLabel = 'Close',
		size = 'md',
		onclose,
		children,
		footer
	}: Props = $props();

	let dialog = $state<HTMLDialogElement | null>(null);

	const widths = { sm: 'max-w-md', md: 'max-w-[740px]', lg: 'max-w-3xl' };

	$effect(() => {
		if (!dialog) return;
		if (open && !dialog.open) dialog.showModal();
		else if (!open && dialog.open) dialog.close();
	});

	function onBackdropClick(event: MouseEvent) {
		if (event.target === dialog) onclose();
	}
</script>

<dialog
	bind:this={dialog}
	oncancel={(event) => {
		event.preventDefault();
		onclose();
	}}
	onclick={onBackdropClick}
	class={`m-auto w-[calc(100%-2rem)] ${widths[size]} rounded-[24px] border border-border bg-surface p-0 text-fg shadow-2xl backdrop:bg-overlay open:animate-pop-in`}
>
	{#if open}
		<div class="flex max-h-[calc(100dvh-4rem)] flex-col">
			<header class="flex items-center justify-between gap-4 px-6 pt-6 pb-2 sm:px-11 sm:pt-10">
				<h2 class="text-[15px] font-semibold text-fg">{title}</h2>
				<IconButton icon="x" label={closeLabel} size="sm" onclick={onclose} />
			</header>
			<div class="thin-scrollbar flex-1 overflow-y-auto px-6 py-4 sm:px-11">
				{@render children()}
			</div>
			{#if footer}
				<footer class="px-6 pt-2 pb-6 sm:px-11 sm:pb-10">
					{@render footer()}
				</footer>
			{/if}
		</div>
	{/if}
</dialog>
