<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	import AppShell from '#lib/components/layout/AppShell.svelte';
	import Logo from '#lib/components/ui/Logo.svelte';
	import Spinner from '#lib/components/ui/Spinner.svelte';
	import { localizedHref, useLocale } from '#lib/i18n/index.ts';
	import { auth } from '#lib/stores/auth.svelte.ts';
	import { lists } from '#lib/stores/lists.svelte.ts';
	import { tasks } from '#lib/stores/tasks.svelte.ts';

	let { children } = $props();

	const locale = useLocale();

	// Auth guard: restore the session, redirect anonymous users to the login page.
	$effect(() => {
		void auth.initialise().then(() => {
			if (auth.status === 'anonymous') {
				const redirect = encodeURIComponent(page.url.pathname + page.url.search);
				void goto(localizedHref(locale(), `/login?redirect=${redirect}`), { replace: true });
			}
		});
	});

	// Load data once the user is known.
	$effect(() => {
		if (auth.isAuthenticated) {
			void lists.load();
			void tasks.load();
		}
	});
</script>

{#if auth.isAuthenticated}
	<AppShell>
		{@render children()}
	</AppShell>
{:else}
	<div class="flex min-h-dvh flex-col items-center justify-center gap-6 bg-bg">
		<Logo size={48} showWordmark={false} />
		<Spinner size={20} class="text-muted" />
	</div>
{/if}
