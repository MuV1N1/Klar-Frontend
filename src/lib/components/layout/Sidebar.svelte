<script lang="ts">
	import { browser } from '$app/env';
	import { page } from '$app/state';

	import { localizedHref, useLocale, useTranslations } from '#lib/i18n/index.ts';
	import { auth } from '#lib/stores/auth.svelte.ts';
	import { lists } from '#lib/stores/lists.svelte.ts';
	import { tasks } from '#lib/stores/tasks.svelte.ts';
	import { ui } from '#lib/stores/ui.svelte.ts';

	import { listColorValue } from '../lists/listHelpers.ts';
	import Icon from '../ui/Icon.svelte';
	import Logo from '../ui/Logo.svelte';
	import Skeleton from '../ui/Skeleton.svelte';
	import FocusCard from './FocusCard.svelte';
	import NavLink from './NavLink.svelte';

	const t = useTranslations();
	const locale = useLocale();

	const href = (path: string) => localizedHref(locale(), path);
	const isActive = (path: string, exact = false) =>
		exact ? page.url.pathname === href(path) : page.url.pathname.startsWith(href(path));

	const close = () => ui.toggleSidebar(false);

	// "⌘ K" on Apple keyboards, the translated "Strg K" / "Ctrl K" elsewhere.
	const isApple = browser && /Mac|iPhone|iPad/.test(navigator.platform);
	const shortcut = $derived(isApple ? '⌘ K' : t('search.shortcut'));
</script>

<nav
	class="thin-scrollbar flex h-full flex-col gap-1 overflow-y-auto px-4 py-6 *:shrink-0 lg:px-5"
	aria-label={t('navigation.menu')}
>
	<a href={href('/app')} class="mb-6 flex items-center px-1" onclick={close}>
		<Logo size={40} />
	</a>

	<!-- Search (Figma: muted input-like row) -->
	<button
		type="button"
		onclick={() => {
			close();
			ui.searchOpen = true;
		}}
		class="mb-4 flex h-12 items-center gap-2.5 rounded-[14px] bg-surface-2 px-4 text-[13px] text-muted transition-colors hover:bg-surface-3 hover:text-fg-2"
	>
		<Icon name="search" size={15} />
		<span class="flex-1 text-left">{t('navigation.search')}</span>
		<kbd
			class="hidden rounded-md border border-border px-1.5 py-0.5 font-sans text-[10px] font-medium text-muted pointer-fine:lg:inline"
		>
			{shortcut}
		</kbd>
	</button>

	<NavLink
		href={href('/app')}
		label={t('navigation.dashboard')}
		icon="sun"
		active={isActive('/app', true)}
		count={tasks.today.length + tasks.overdue.length}
		onclick={close}
	/>
	<NavLink
		href={href('/app/upcoming')}
		label={t('navigation.upcoming')}
		icon="calendar"
		active={isActive('/app/upcoming')}
		onclick={close}
	/>
	<NavLink
		href={href('/app/inbox')}
		label={t('navigation.inbox')}
		icon="inbox"
		active={isActive('/app/inbox')}
		count={tasks.inbox.length}
		onclick={close}
	/>
	<NavLink
		href={href('/app/completed')}
		label={t('navigation.completed')}
		icon="check"
		active={isActive('/app/completed')}
		onclick={close}
	/>

	<div class="mt-6 mb-2 flex items-center justify-between px-3">
		<a href={href('/app/lists')} class="section-label hover:text-fg" onclick={close}>
			{t('navigation.lists')}
		</a>
	</div>

	{#if lists.isLoading}
		<div class="flex flex-col gap-3 px-3 py-2">
			<Skeleton class="h-4 w-28" />
			<Skeleton class="h-4 w-20" />
			<Skeleton class="h-4 w-24" />
		</div>
	{:else}
		{#each lists.items as list (list.id)}
			<NavLink
				href={href(`/app/lists/${list.id}`)}
				label={list.name}
				color={listColorValue(list.color)}
				active={isActive(`/app/lists/${list.id}`)}
				count={tasks.openCountForList(list.id)}
				onclick={close}
			/>
		{/each}
	{/if}

	<button
		type="button"
		onclick={() => {
			close();
			ui.openNewList();
		}}
		class="mt-1 flex h-10 items-center gap-2 rounded-[12px] px-3 text-[13px] font-medium text-accent-text transition-colors hover:bg-surface-2"
	>
		<Icon name="plus" size={15} strokeWidth={2.5} />
		{t('navigation.newList')}
	</button>

	<div class="mt-auto flex flex-col gap-3 pt-6">
		<FocusCard />
		<NavLink
			href={href('/app/settings')}
			label={t('navigation.settings')}
			icon="settings"
			active={isActive('/app/settings')}
			onclick={close}
		/>
		{#if auth.user}
			<div class="flex items-center gap-3 px-3 pt-1 pb-1">
				<span
					class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-3 text-[12px] font-semibold text-fg"
				>
					{auth.user.name.slice(0, 1).toUpperCase()}
				</span>
				<span class="flex min-w-0 flex-col">
					<span class="truncate text-[13px] font-medium text-fg">{auth.user.name}</span>
					<span class="truncate text-[11px] text-muted">{auth.user.email}</span>
				</span>
			</div>
		{/if}
	</div>
</nav>
