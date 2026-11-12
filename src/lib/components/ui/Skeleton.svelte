<script lang="ts">
	let { class: className = 'h-4 w-full' }: { class?: string } = $props();
</script>

<div class={`animate-pulse rounded-[10px] bg-surface-3 ${className}`} aria-hidden="true"></div>
