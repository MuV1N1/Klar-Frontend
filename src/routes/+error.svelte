<script lang="ts">
	import { page } from '$app/state';

	import Button from '#lib/components/ui/Button.svelte';
	import Logo from '#lib/components/ui/Logo.svelte';
	import { DEFAULT_LOCALE, getTranslations, isLocale, translate } from '#lib/i18n/index.ts';

	// The error page may render outside the [locale] layout, so resolve translations directly.
	const locale = $derived(isLocale(page.params.locale) ? page.params.locale : DEFAULT_LOCALE);
	const t = (key: string) => translate(getTranslations(locale), locale, key);
</script>

<div class="flex min-h-dvh flex-col items-center justify-center gap-6 bg-bg px-6 text-center">
	<Logo size={48} showWordmark={false} />
	<p class="text-[72px] leading-none font-bold tracking-tight text-fg">{page.status}</p>
	<div>
		<p class="text-[15px] font-medium text-fg">
			{page.status === 404 ? t('errors.notFound') : t('common.errorTitle')}
		</p>
		<p class="mt-1 text-sm text-muted">
			{page.status === 404 ? t('errors.notFoundHint') : page.error?.message}
		</p>
	</div>
	<Button href={`/${locale}/app`} variant="primary" icon="arrowLeft">{t('errors.goHome')}</Button>
</div>
