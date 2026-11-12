<script lang="ts">
	import { goto } from '$app/navigation';

	import Button from '#lib/components/ui/Button.svelte';
	import Icon from '#lib/components/ui/Icon.svelte';
	import Logo from '#lib/components/ui/Logo.svelte';
	import {
		LOCALE_NAMES,
		LOCALES,
		localizedHref,
		useLocale,
		useTranslations
	} from '#lib/i18n/index.ts';
	import { auth } from '#lib/stores/auth.svelte.ts';
	import { formatLongDate, todayISO } from '#lib/utils/date.ts';

	const t = useTranslations();
	const locale = useLocale();

	const href = (path: string) => localizedHref(locale(), path);

	// Signed-in users go straight to the app
	$effect(() => {
		void auth.initialise().then(() => {
			if (auth.isAuthenticated) void goto(href('/app'), { replace: true });
		});
	});

	const features = ['capture', 'plan', 'lists', 'focus'] as const;
</script>

<svelte:head>
	<title>{t('app.name')} – {t('app.tagline')}</title>
</svelte:head>

<div class="min-h-dvh bg-bg text-fg">
	<!-- Nav (Figma 06) -->
	<header class="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-6 sm:px-10">
		<Logo size={40} />
		<nav class="hidden items-center gap-10 text-[13px] text-muted md:flex">
			<a href="#features" class="hover:text-fg">{t('landing.nav.features')}</a>
			<a href="#how" class="hover:text-fg">{t('landing.nav.how')}</a>
			<a href="#pricing" class="hover:text-fg">{t('landing.nav.pricing')}</a>
		</nav>
		<div class="flex items-center gap-2 sm:gap-4">
			<div class="hidden items-center gap-1 text-[12px] text-muted sm:flex">
				{#each LOCALES as l (l)}
					<a
						href={localizedHref(l, '/')}
						hreflang={l}
						class={`rounded-md px-1.5 py-0.5 hover:text-fg ${l === locale() ? 'text-fg' : ''}`}
						aria-label={LOCALE_NAMES[l]}
					>
						{l.toUpperCase()}
					</a>
				{/each}
			</div>
			<a href={href('/login')} class="text-[13px] text-fg-2 hover:text-fg"
				>{t('landing.nav.login')}</a
			>
			<Button
				href={href('/register')}
				variant="primary"
				class="!bg-fg !text-bg dark:!bg-white dark:!text-[#101114]"
			>
				{t('landing.nav.start')}
			</Button>
		</div>
	</header>

	<!-- Hero -->
	<section
		class="mx-auto grid max-w-[1280px] items-center gap-12 px-6 pt-10 pb-20 sm:px-10 lg:grid-cols-[1.1fr_1fr] lg:pt-16"
	>
		<div class="flex animate-rise-in flex-col items-start gap-8">
			<span
				class="inline-flex items-center gap-2 rounded-full border border-border px-4 py-1.5 text-[12px] text-muted"
			>
				<span class="h-2 w-2 rounded-full bg-accent"></span>
				{t('landing.badge')}
			</span>
			<h1
				class="text-[52px] leading-[0.95] font-bold tracking-[-0.03em] sm:text-[76px] lg:text-[88px]"
			>
				{t('landing.headline1')}<br />
				{t('landing.headline2')} <span class="text-accent-text">{t('landing.headline3')}</span>
			</h1>
			<p class="max-w-md text-[15px] leading-7 text-muted">{t('landing.lead')}</p>
			<div class="flex flex-wrap items-center gap-3">
				<Button
					href={href('/register')}
					variant="primary"
					size="lg"
					iconRight="arrowRight"
					class="!rounded-full !px-8"
				>
					{t('landing.cta')}
				</Button>
				<Button href="#how" variant="outline" size="lg" class="!rounded-full !px-8">
					{t('landing.secondary')}
				</Button>
			</div>
		</div>

		<!-- App preview card (Figma: tilted surface card) -->
		<div
			class="relative mx-auto w-full max-w-[520px] animate-fade-in lg:[transform:perspective(1200px)_rotateY(-8deg)_rotateX(3deg)]"
		>
			<div class="rounded-[24px] border border-border bg-surface p-6 shadow-2xl sm:p-10">
				<p class="text-[12px] text-muted">{formatLongDate(todayISO(), locale())}</p>
				<p class="mt-4 text-[13px] font-medium text-fg">{t('common.today')}</p>
				<div class="mt-5 flex flex-col gap-3">
					{#each [1, 2, 3] as index (index)}
						<div
							class="flex items-center gap-3 rounded-[14px] border border-border bg-surface-2 px-4 py-3.5"
						>
							<span
								class={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${index === 1 ? 'border-accent bg-accent' : 'border-border-strong'}`}
							>
								{#if index === 1}<Icon
										name="check"
										size={11}
										strokeWidth={3}
										class="text-accent-fg"
									/>{/if}
							</span>
							<span class={`text-[13px] ${index === 1 ? 'text-muted line-through' : 'text-fg-2'}`}>
								{t(`landing.preview.task${index}`)}
							</span>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</section>

	<!-- Features -->
	<section id="features" class="mx-auto max-w-[1280px] px-6 py-16 sm:px-10">
		<p class="section-label !text-accent-text">{t('landing.features.eyebrow')}</p>
		<h2 class="mt-3 text-[28px] font-semibold tracking-tight sm:text-[34px]">
			{t('landing.features.title')}
		</h2>
		<dl
			class="mt-10 grid gap-x-10 gap-y-8 border-t border-border pt-10 sm:grid-cols-2 lg:grid-cols-4"
		>
			{#each features as feature (feature)}
				<div>
					<dt class="text-[15px] font-semibold">{t(`landing.features.${feature}.title`)}</dt>
					<dd class="mt-2 text-[14px] leading-6 text-muted">
						{t(`landing.features.${feature}.text`)}
					</dd>
				</div>
			{/each}
		</dl>
	</section>

	<!-- How -->
	<section id="how" class="mx-auto max-w-[1280px] px-6 py-16 sm:px-10">
		<p class="section-label !text-accent-text">{t('landing.how.eyebrow')}</p>
		<h2 class="mt-3 text-[28px] font-semibold tracking-tight sm:text-[34px]">
			{t('landing.how.title')}
		</h2>
		<ol class="mt-10 grid gap-x-10 gap-y-6 border-t border-border pt-10 sm:grid-cols-3">
			{#each [1, 2, 3] as step (step)}
				<li class="flex items-baseline gap-4">
					<span class="text-[13px] text-muted tabular-nums">0{step}</span>
					<span class="text-[17px] font-medium">{t(`landing.how.step${step}`)}</span>
				</li>
			{/each}
		</ol>
	</section>

	<!-- Pricing -->
	<section id="pricing" class="mx-auto max-w-[1280px] px-6 py-16 sm:px-10">
		<div
			class="flex flex-col items-start gap-6 rounded-[24px] border border-border bg-surface p-8 sm:p-12 lg:flex-row lg:items-center lg:justify-between"
		>
			<div>
				<p class="section-label !text-accent-text">{t('landing.pricing.eyebrow')}</p>
				<h2 class="mt-3 text-[28px] font-semibold tracking-tight sm:text-[34px]">
					{t('landing.pricing.title')}
				</h2>
				<p class="mt-3 text-[14px] text-muted">{t('landing.pricing.text')}</p>
			</div>
			<Button
				href={href('/register')}
				variant="primary"
				size="lg"
				iconRight="arrowRight"
				class="!rounded-full !px-8"
			>
				{t('landing.cta')}
			</Button>
		</div>
	</section>

	<footer
		class="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-10 text-[12px] text-muted sm:px-10"
	>
		<span>{t('landing.footer')}</span>
		<Logo size={22} showWordmark={false} />
	</footer>
</div>
