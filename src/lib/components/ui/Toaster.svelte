<script lang="ts">
	import { toasts } from '#lib/stores/toasts.svelte.ts';

	import Icon from './Icon.svelte';
</script>

<div
	class="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+5rem)] z-50 flex flex-col items-center gap-2 px-4 md:bottom-6"
	aria-live="polite"
>
	{#each toasts.items as toast (toast.id)}
		<div
			class="pointer-events-auto flex max-w-md animate-rise-in items-center gap-3 rounded-[14px] border border-border bg-surface px-4 py-3 text-sm text-fg shadow-xl"
		>
			<span
				class={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
					toast.kind === 'success'
						? 'bg-accent text-accent-fg'
						: toast.kind === 'error'
							? 'bg-danger/15 text-danger-text'
							: 'bg-surface-3 text-muted'
				}`}
			>
				<Icon
					name={toast.kind === 'success'
						? 'check'
						: toast.kind === 'error'
							? 'alertCircle'
							: 'info'}
					size={13}
					strokeWidth={2.5}
				/>
			</span>
			<span class="min-w-0 flex-1 truncate">{toast.message}</span>
			{#if toast.action}
				<button
					type="button"
					class="shrink-0 text-[13px] font-semibold text-accent-text hover:underline"
					onclick={() => {
						toast.action?.onClick();
						toasts.dismiss(toast.id);
					}}
				>
					{toast.action.label}
				</button>
			{/if}
		</div>
	{/each}
</div>
