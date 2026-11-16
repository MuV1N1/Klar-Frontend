<script lang="ts">
	import { settings } from '#lib/stores/settings.svelte.ts';
	import { weekDaysISO } from '#lib/utils/date.ts';

	import DayAgenda from './DayAgenda.svelte';

	interface Props {
		selected: string;
	}

	let { selected }: Props = $props();

	const days = $derived(weekDaysISO(selected, settings.value.weekStart));
</script>

<div class="flex flex-col gap-8">
	{#each days as day (day)}
		<DayAgenda {day} />
	{/each}
</div>
