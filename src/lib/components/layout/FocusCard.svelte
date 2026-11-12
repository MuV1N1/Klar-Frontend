<script lang="ts">
	import { localizedHref, useLocale, useTranslations } from '#lib/i18n/index.ts';
	import { settings } from '#lib/stores/settings.svelte.ts';

	const t = useTranslations();
	const locale = useLocale();

	const minutes = $derived(String(settings.value.focusMinutes).padStart(2, '0'));
</script>

<!-- Figma: FOKUS card at the bottom of the sidebar -->
<a
	href={localizedHref(locale(), '/app/focus')}
	class="group flex flex-col rounded-[18px] bg-surface-2 px-5 pt-4 pb-3 transition-colors hover:bg-surface-3"
>
	<span class="section-label">{t('navigation.focus')}</span>
	<span class="mt-1 text-[40px] leading-none font-bold tracking-tight text-fg tabular-nums"
		>{minutes}:00</span
	>
	<span class="mt-3 border-t border-border pt-2.5 text-[12px] text-muted group-hover:text-fg-2">
		{t('focus.start')}
	</span>
</a>
