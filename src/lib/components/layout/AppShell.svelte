<script lang="ts">
	import type { Snippet } from 'svelte';

	import { page } from '$app/state';

	import { useTranslations } from '#lib/i18n/index.ts';
	import { ui } from '#lib/stores/ui.svelte.ts';

	import ListDialog from '../lists/ListDialog.svelte';
	import EventDialog from '../calendar/EventDialog.svelte';
	import ScopeDialog from '../calendar/ScopeDialog.svelte';
	import TaskDialog from '../tasks/TaskDialog.svelte';
	import IconButton from '../ui/IconButton.svelte';
	import Logo from '../ui/Logo.svelte';
	import BottomNav from './BottomNav.svelte';
	import FocusIsland from './FocusIsland.svelte';
	import SearchDialog from './SearchDialog.svelte';
	import Sidebar from './Sidebar.svelte';

	let { children }: { children: Snippet } = $props();

	const t = useTranslations();

	// The calendar uses the full width; text pages stay narrow for readability.
	const wide = $derived(/\/app\/calendar(\/|$)/.test(page.url.pathname));
</script>

<div class="flex min-h-dvh bg-bg">
	<!-- Desktop sidebar sits on the page background; the content gets its own sheet -->
	<aside
		class="sticky top-0 hidden h-dvh w-[244px] shrink-0 bg-sidebar md:block lg:w-[272px] xl:w-[288px]"
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
				class="absolute inset-y-0 left-0 w-[300px] max-w-[85vw] animate-rise-in bg-sidebar pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] shadow-2xl"
			>
				<Sidebar />
			</aside>
		</div>
	{/if}

	<div
		class="flex min-w-0 flex-1 flex-col bg-surface md:my-2.5 md:mr-2.5 md:min-h-[calc(100dvh-20px)] md:rounded-[20px] md:shadow-[0_0_0_1px_var(--border)]"
	>
		<!-- Mobile top bar -->
		<header
			class="sticky top-0 z-20 flex h-[calc(3.5rem+env(safe-area-inset-top))] items-center justify-between border-b border-line bg-surface/90 px-4 pt-[env(safe-area-inset-top)] backdrop-blur md:hidden"
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
			class={`mx-auto w-full ${wide ? 'max-w-[1560px]' : 'max-w-[1040px]'} flex-1 px-4 pt-6 pb-28 sm:px-8 md:px-7 md:pt-10 md:pb-16 lg:px-14 lg:pt-12`}
		>
			{@render children()}
		</main>
	</div>

	<FocusIsland />
	<BottomNav />
	<TaskDialog />
	<EventDialog />
	<ScopeDialog
		open={ui.scopePrompt !== null}
		action={ui.scopePrompt?.action ?? 'save'}
		onchoose={(scope) => ui.answerScope(scope)}
		onclose={() => ui.answerScope(null)}
	/>
	<ListDialog />
	<SearchDialog />
</div>
