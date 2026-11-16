<script lang="ts">
	import Icon from '#lib/components/ui/Icon.svelte';
	import type { IconName } from '#lib/components/ui/icons.ts';
	import PageHeader from '#lib/components/ui/PageHeader.svelte';
	import { localizedHref, useLocale, useTranslations } from '#lib/i18n/index.ts';

	const t = useTranslations();
	const locale = useLocale();

	/** One tile per admin tool; new tools only need an entry here and their own page below /admin. */
	const tools: { path: string; icon: IconName; key: string }[] = [
		{ path: '/app/admin/translations', icon: 'globe', key: 'translations' }
	];
</script>

<svelte:head><title>{t('admin.title')} – {t('app.name')}</title></svelte:head>

<PageHeader
	eyebrow={t('admin.eyebrow')}
	title={t('admin.title')}
	description={t('admin.description')}
/>

<div class="grid animate-rise-in gap-4 sm:grid-cols-2 xl:grid-cols-3">
	{#each tools as tool (tool.path)}
		<a
			href={localizedHref(locale(), tool.path)}
			class="group flex items-start gap-4 rounded-[18px] border border-border bg-surface p-5 transition-colors hover:border-accent-line hover:bg-surface-2 sm:p-6"
		>
			<span
				class="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-accent-soft text-accent-text"
			>
				<Icon name={tool.icon} size={18} />
			</span>
			<span class="flex min-w-0 flex-1 flex-col gap-1">
				<span class="text-[15px] font-semibold text-fg">{t(`admin.tools.${tool.key}.title`)}</span>
				<span class="text-[13px] text-muted">{t(`admin.tools.${tool.key}.description`)}</span>
			</span>
			<Icon
				name="chevronRight"
				size={16}
				class="mt-1 shrink-0 text-muted transition-transform group-hover:translate-x-0.5"
			/>
		</a>
	{/each}
</div>
