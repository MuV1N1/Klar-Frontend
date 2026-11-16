<script lang="ts">
	import { invalidate } from '$app/navigation';

	import Button from '#lib/components/ui/Button.svelte';
	import EmptyState from '#lib/components/ui/EmptyState.svelte';
	import ErrorState from '#lib/components/ui/ErrorState.svelte';
	import Input from '#lib/components/ui/Input.svelte';
	import PageHeader from '#lib/components/ui/PageHeader.svelte';
	import Select from '#lib/components/ui/Select.svelte';
	import Skeleton from '#lib/components/ui/Skeleton.svelte';
	import Textarea from '#lib/components/ui/Textarea.svelte';
	import { api, ApiError } from '#lib/api/index.ts';
	import { LOCALES, LOCALE_NAMES, useTranslations, type Locale } from '#lib/i18n/index.ts';
	import { auth } from '#lib/stores/auth.svelte.ts';
	import { toasts } from '#lib/stores/toasts.svelte.ts';
	import type { TranslationEntry } from '#lib/types/index.ts';

	const t = useTranslations();

	/** Rendering ~1000 textareas at once is slow; more appear on demand. */
	const PAGE_SIZE = 50;

	let entries = $state<TranslationEntry[]>([]);
	let status = $state<'loading' | 'ready' | 'error'>('loading');
	let query = $state('');
	let onlyChanged = $state(false);
	let namespace = $state('');
	let limit = $state(PAGE_SIZE);
	/** Unsaved edits, keyed by `locale|key`. */
	let drafts = $state<Record<string, string>>({});
	let saving = $state<Record<string, boolean>>({});

	const isAdmin = $derived(auth.user?.role === 'admin');

	async function load() {
		status = 'loading';
		try {
			entries = await api.admin.translations();
			status = 'ready';
		} catch {
			status = 'error';
		}
	}

	$effect(() => {
		if (isAdmin) void load();
	});

	const namespaces = $derived([...new Set(entries.map((entry) => entry.key.split('.')[0]))]);

	const isChanged = (entry: TranslationEntry) => Object.keys(entry.overrides).length > 0;
	const current = (entry: TranslationEntry, locale: Locale) =>
		entry.overrides[locale] ?? entry.defaults[locale];
	const draftKey = (entry: TranslationEntry, locale: Locale) => `${locale}|${entry.key}`;

	const filtered = $derived.by(() => {
		const needle = query.trim().toLowerCase();
		return entries.filter(
			(entry) =>
				(!namespace || entry.key.split('.')[0] === namespace) &&
				(!onlyChanged || isChanged(entry)) &&
				(!needle ||
					entry.key.toLowerCase().includes(needle) ||
					LOCALES.some((locale) => current(entry, locale).toLowerCase().includes(needle)))
		);
	});

	const changedCount = $derived(entries.filter(isChanged).length);

	// A new filter starts at the top again.
	$effect(() => {
		void query;
		void onlyChanged;
		void namespace;
		limit = PAGE_SIZE;
	});

	function placeholders(text: string): string[] {
		return [...new Set([...text.matchAll(/\{(\w+)\}/g)].map((match) => `{${match[1]}}`))];
	}

	async function save(entry: TranslationEntry, locale: Locale, value: string | null) {
		const id = draftKey(entry, locale);
		saving[id] = true;
		try {
			const updated = await api.admin.updateTranslation(locale, entry.key, value);
			entries = entries.map((e) => (e.key === updated.key ? updated : e));
			delete drafts[id];
			// The texts of the running app come from the root layout
			await invalidate('klar:i18n');
			toasts.success(
				value === null ? t('admin.translations.resetDone') : t('admin.translations.saved')
			);
		} catch (error) {
			const code =
				error instanceof ApiError && error.details && typeof error.details === 'object'
					? (error.details as { code?: string }).code
					: undefined;
			toasts.error(
				code === 'unknown_placeholder'
					? t('admin.translations.unknownPlaceholder')
					: t('common.errorGeneric')
			);
		} finally {
			saving[id] = false;
		}
	}
</script>

<svelte:head><title>{t('admin.translations.title')} – {t('app.name')}</title></svelte:head>

<PageHeader
	eyebrow={t('admin.translations.eyebrow')}
	title={t('admin.translations.title')}
	description={t('admin.translations.description')}
/>

{#if !isAdmin}
	<EmptyState
		icon="eyeOff"
		title={t('admin.translations.noAccess')}
		description={t('admin.translations.noAccessHint')}
	/>
{:else if status === 'error'}
	<ErrorState
		title={t('common.errorTitle')}
		message={t('common.errorGeneric')}
		retryLabel={t('common.retry')}
		onretry={() => void load()}
	/>
{:else if status === 'loading'}
	<div class="flex flex-col gap-3" aria-busy="true">
		<Skeleton class="h-12 rounded-[14px]" />
		<Skeleton class="h-40 rounded-[18px]" />
		<Skeleton class="h-40 rounded-[18px]" />
	</div>
{:else}
	<div class="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
		<Input
			class="sm:flex-1"
			type="search"
			bind:value={query}
			placeholder={t('admin.translations.search')}
			aria-label={t('admin.translations.search')}
		/>
		<div class="flex items-center gap-3">
			<Select
				bind:value={namespace}
				aria-label={t('admin.translations.namespace')}
				options={[
					{ value: '', label: t('admin.translations.allNamespaces') },
					...namespaces.map((name) => ({ value: name, label: name }))
				]}
			/>
			<label class="flex shrink-0 items-center gap-2 text-[13px] text-fg-2">
				<input type="checkbox" bind:checked={onlyChanged} class="rounded border-border" />
				{t('admin.translations.onlyChanged', { count: changedCount })}
			</label>
		</div>
	</div>

	<p class="mb-3 text-[12px] text-muted">
		{t('admin.translations.count', { count: filtered.length })}
	</p>

	{#if filtered.length === 0}
		<EmptyState icon="search" title={t('admin.translations.empty')} compact />
	{:else}
		<div class="flex flex-col gap-3">
			{#each filtered.slice(0, limit) as entry (entry.key)}
				<section class="rounded-[18px] border border-border bg-surface p-4 sm:p-5">
					<div class="mb-3 flex items-center gap-2">
						<code class="truncate font-mono text-[12px] text-fg-2">{entry.key}</code>
						{#if isChanged(entry)}
							<span
								class="shrink-0 rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-accent-text"
							>
								{t('admin.translations.changed')}
							</span>
						{/if}
					</div>
					<div class="grid gap-4 md:grid-cols-2">
						{#each LOCALES as locale (locale)}
							{@const id = draftKey(entry, locale)}
							{@const value = drafts[id] ?? current(entry, locale)}
							{@const dirty = id in drafts && drafts[id] !== current(entry, locale)}
							{@const vars = placeholders(entry.defaults[locale])}
							<div class="flex flex-col gap-1.5">
								<span class="text-[11px] font-medium tracking-wide text-muted uppercase">
									{LOCALE_NAMES[locale]}
								</span>
								<Textarea
									{value}
									rows={Math.min(
										8,
										Math.max(1, value.split('\n').length, Math.ceil(value.length / 60))
									)}
									aria-label={`${entry.key} (${LOCALE_NAMES[locale]})`}
									oninput={(e) => (drafts[id] = e.currentTarget.value)}
								/>
								{#if vars.length > 0}
									<p class="text-[11px] text-muted">
										{t('admin.translations.placeholders')}
										<code class="font-mono">{vars.join(' ')}</code>
									</p>
								{/if}
								{#if entry.overrides[locale] !== undefined}
									<p class="text-[11px] whitespace-pre-line text-muted">
										{t('admin.translations.default')}
										{entry.defaults[locale]}
									</p>
								{/if}
								{#if dirty || entry.overrides[locale] !== undefined}
									<div class="flex gap-2">
										{#if dirty}
											<Button
												size="sm"
												variant="primary"
												loading={saving[id]}
												disabled={!drafts[id]?.trim()}
												onclick={() => void save(entry, locale, drafts[id])}
											>
												{t('common.save')}
											</Button>
											<Button size="sm" variant="ghost" onclick={() => delete drafts[id]}>
												{t('common.cancel')}
											</Button>
										{:else}
											<Button
												size="sm"
												variant="ghost"
												icon="rotate"
												loading={saving[id]}
												onclick={() => void save(entry, locale, null)}
											>
												{t('admin.translations.reset')}
											</Button>
										{/if}
									</div>
								{/if}
							</div>
						{/each}
					</div>
				</section>
			{/each}
		</div>
		{#if filtered.length > limit}
			<div class="mt-5 flex justify-center">
				<Button variant="outline" onclick={() => (limit += PAGE_SIZE)}>
					{t('admin.translations.showMore')}
				</Button>
			</div>
		{/if}
	{/if}
{/if}
