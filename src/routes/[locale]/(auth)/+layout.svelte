<script lang="ts">
	import { goto } from '$app/navigation';

	import Icon from '#lib/components/ui/Icon.svelte';
	import Logo from '#lib/components/ui/Logo.svelte';
	import { localizedHref, useLocale, useTranslations } from '#lib/i18n/index.ts';
	import { apiConfig } from '#lib/api/config.ts';
	import { auth } from '#lib/stores/auth.svelte.ts';

	let { children } = $props();

	const t = useTranslations();
	const locale = useLocale();

	$effect(() => {
		void auth.initialise().then(() => {
			if (auth.isAuthenticated) void goto(localizedHref(locale(), '/app'), { replace: true });
		});
	});
</script>

<div class="flex min-h-dvh flex-col bg-bg px-4 py-8 sm:px-6">
	<a href={localizedHref(locale(), '/')} class="mx-auto sm:mx-0"><Logo size={40} /></a>

	<div class="flex flex-1 items-center justify-center py-10">
		<div class="w-full max-w-[440px] animate-rise-in">
			{#if apiConfig.useMock}
				<p
					class="mb-5 flex items-start gap-2 rounded-[14px] border border-border bg-surface px-4 py-3 text-[12px] text-muted"
				>
					<Icon name="info" size={14} class="mt-0.5 shrink-0 text-accent-text" />
					{t('auth.demoBanner')}
				</p>
			{/if}
			<div class="rounded-[24px] border border-border bg-surface p-7 sm:p-10">
				{@render children()}
			</div>
		</div>
	</div>
</div>
