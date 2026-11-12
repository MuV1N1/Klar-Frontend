<script lang="ts">
	import { page } from '$app/state';

	import { localizedHref, useLocale, useTranslations } from '#lib/i18n/index.ts';
	import { ui } from '#lib/stores/ui.svelte.ts';

	import Icon from '../ui/Icon.svelte';
	import type { IconName } from '../ui/icons.ts';

	const t = useTranslations();
	const locale = useLocale();

	const href = (path: string) => localizedHref(locale(), path);

	const items = $derived<{ path: string; label: string; icon: IconName; exact?: boolean }[]>([
		{ path: '/app', label: t('navigation.dashboard'), icon: 'sun', exact: true },
		{ path: '/app/upcoming', label: t('navigation.upcoming'), icon: 'calendar' },
		{ path: '/app/lists', label: t('navigation.lists'), icon: 'layers' },
		{ path: '/app/settings', label: t('navigation.settings'), icon: 'settings' }
	]);

	const isActive = (path: string, exact?: boolean) =>
		exact ? page.url.pathname === href(path) : page.url.pathname.startsWith(href(path));
</script>

<!-- Mobile navigation: four tabs with a centred lime "new task" button -->
<nav
	class="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-sidebar/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
	aria-label={t('navigation.menu')}
>
	<div class="grid h-16 grid-cols-5 items-center px-2">
		{#each items as item, index (item.path)}
			{#if index === 2}
				<button
					type="button"
					aria-label={t('navigation.newTask')}
					onclick={() => ui.openNewTask()}
					class="mx-auto -mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-fg shadow-[inset_0_0_0_1px_var(--accent-line),0_8px_20px_rgba(0,0,0,0.18)] transition-transform active:scale-95"
				>
					<Icon name="plus" size={24} strokeWidth={2.5} />
				</button>
			{/if}
			<a
				href={href(item.path)}
				aria-current={isActive(item.path, item.exact) ? 'page' : undefined}
				class={`flex min-w-0 flex-col items-center justify-center gap-1 rounded-[12px] px-1 py-1.5 text-[10px] font-medium transition-colors ${
					isActive(item.path, item.exact) ? 'text-fg' : 'text-muted hover:text-fg-2'
				}`}
			>
				<Icon
					name={item.icon}
					size={20}
					class={isActive(item.path, item.exact) ? 'text-accent-text' : ''}
				/>
				<span class="max-w-full truncate">{item.label}</span>
			</a>
		{/each}
	</div>
</nav>
