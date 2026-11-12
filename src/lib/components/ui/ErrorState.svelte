<script lang="ts">
	import Button from './Button.svelte';
	import Icon from './Icon.svelte';

	interface Props {
		title: string;
		message: string;
		retryLabel: string;
		onretry: () => void;
	}

	let { title, message, retryLabel, onretry }: Props = $props();
</script>

<div
	role="alert"
	class="flex flex-col items-center gap-3 rounded-[18px] border border-danger/30 bg-danger/5 px-6 py-12 text-center"
>
	<span
		class="flex h-11 w-11 items-center justify-center rounded-full bg-danger/10 text-danger-text"
	>
		<Icon name="alertCircle" size={20} />
	</span>
	<p class="text-sm font-medium text-fg">{title}</p>
	<p class="max-w-sm text-[13px] text-muted">{message}</p>
	<Button variant="outline" size="sm" icon="refresh" onclick={onretry}>{retryLabel}</Button>
</div>
