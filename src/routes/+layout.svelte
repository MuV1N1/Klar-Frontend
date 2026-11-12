<script lang="ts">
	import '../app.css';

	import { settings } from '#lib/stores/settings.svelte.ts';
	import Toaster from '#lib/components/ui/Toaster.svelte';

	let { children } = $props();

	$effect(() => {
		settings.hydrate();
	});
</script>

{@render children()}
<Toaster />
