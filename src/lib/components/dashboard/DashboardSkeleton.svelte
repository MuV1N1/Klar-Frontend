<script lang="ts">
	import Skeleton from '../ui/Skeleton.svelte';
</script>

<div class="flex flex-col gap-8" aria-busy="true">
	<div class="flex flex-col gap-3">
		<Skeleton class="h-4 w-40" />
		<Skeleton class="h-8 w-72" />
	</div>
	<Skeleton class="h-[76px] rounded-[18px]" />
	<Skeleton class="h-[66px] rounded-[18px]" />
	<div class="flex flex-col gap-3">
		<Skeleton class="h-3 w-20" />
		{#each [1, 2, 3] as i (i)}<Skeleton class="h-[68px] rounded-[18px]" />{/each}
	</div>
</div>
