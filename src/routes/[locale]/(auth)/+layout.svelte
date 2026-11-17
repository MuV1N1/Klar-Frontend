<script lang="ts">
	import { goto } from '$app/navigation';

	import Logo from '#lib/components/ui/Logo.svelte';
	import { localizedHref, useLocale } from '#lib/i18n/index.ts';
	import { auth } from '#lib/stores/auth.svelte.ts';

	let { children } = $props();

	const locale = useLocale();

	$effect(() => {
		void auth.initialise().then(() => {
			if (auth.isAuthenticated) void goto(localizedHref(locale(), '/app'), { replace: true });
		});
	});
</script>

<div
	class="flex min-h-dvh flex-col bg-bg px-4 pt-[calc(2rem+env(safe-area-inset-top))] pb-[calc(2rem+env(safe-area-inset-bottom))] sm:px-6"
>
	<a href={localizedHref(locale(), '/')} class="mx-auto sm:mx-0"><Logo size={40} /></a>

	<div class="flex flex-1 items-center justify-center py-10">
		<div class="w-full max-w-[440px] animate-rise-in">
			<div class="rounded-[24px] border border-border bg-surface p-7 sm:p-10">
				{@render children()}
			</div>
		</div>
	</div>
</div>
