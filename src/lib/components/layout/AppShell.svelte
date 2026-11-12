<script lang="ts">
	import type { Snippet } from 'svelte';

	import { useTranslations } from '#lib/i18n/index.ts';
	import { ui } from '#lib/stores/ui.svelte.ts';

	import ListDialog from '../lists/ListDialog.svelte';
	import TaskDialog from '../tasks/TaskDialog.svelte';
	import IconButton from '../ui/IconButton.svelte';
	import Logo from '../ui/Logo.svelte';
	import BottomNav from './BottomNav.svelte';
	import SearchDialog from './SearchDialog.svelte';
	import Sidebar from './Sidebar.svelte';

	let { children }: { children: Snippet } = $props();

	const t = useTranslations();
</script>

<div class="flex min-h-dvh bg-bg">
	<!-- Desktop sidebar (Figma: 330px, darker surface, right border) -->
	<aside
		class="sticky top-0 hidden h-dvh w-[244px] shrink-0 border-r border-border bg-sidebar md:block lg:w-[290px] xl:w-[320px]"
	>
		<Sidebar />
	</aside>

	<!-- Mobile drawer -->
	{#if ui.sidebarOpen}
		<div class="fixed inset-0 z-40 md:hidden">
			<button
				type="button"
				aria-label={t('navigation.closeSidebar')}
				class="absolute inset-0 animate-fade-in bg-overlay"
				onclick={() => ui.toggleSidebar(false)}
			></button>
			<aside
				class="absolute inset-y-0 left-0 w-[300px] max-w-[85vw] animate-rise-in bg-sidebar shadow-2xl"
			>
				<Sidebar />
			</aside>
		</div>
	{/if}

	<div class="flex min-w-0 flex-1 flex-col">
		<!-- Mobile top bar -->
		<header
			class="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-bg/90 px-4 backdrop-blur md:hidden"
		>
			<IconButton
				icon="menu"
				label={t('navigation.openSidebar')}
				onclick={() => ui.toggleSidebar(true)}
			/>
			<Logo size={28} />
			<IconButton
				icon="search"
				label={t('navigation.search')}
				onclick={() => (ui.searchOpen = true)}
			/>
		</header>

		<main
			class="mx-auto w-full max-w-[1040px] flex-1 px-4 pt-6 pb-28 sm:px-8 md:px-7 md:pt-10 md:pb-16 lg:px-14 lg:pt-12"
		>
			{@render children()}
		</main>
	</div>

	<BottomNav />
	<TaskDialog />
	<ListDialog />
	<SearchDialog />
</div>
