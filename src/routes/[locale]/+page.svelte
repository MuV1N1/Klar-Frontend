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
	const featureIcons = {
		capture: 'inbox',
		plan: 'calendar',
		lists: 'users',
		focus: 'clock'
	} as const;
	const stepIcons = ['plus', 'calendar', 'check'] as const;
</script>

<svelte:head>
	<title>{t('app.name')} – {t('app.tagline')}</title>
</svelte:head>

<div class="min-h-dvh bg-bg text-fg">
	<!-- Hero on deep ink; the preview card bridges into the page below -->
	<section
		class="bg-[linear-gradient(var(--ink)_0,var(--ink)_calc(100%-120px),transparent_calc(100%-120px))] pt-[env(safe-area-inset-top)] text-ink-fg"
	>
		<header
			class="mx-auto grid max-w-[1240px] grid-cols-[1fr_auto] items-center gap-4 px-6 py-6 sm:px-10 md:grid-cols-3"
		>
			<Logo size={34} />
			<nav class="hidden items-center justify-center gap-8 text-[15px] text-ink-muted md:flex">
				<a href="#features" class="hover:text-ink-fg">{t('landing.nav.features')}</a>
				<a href="#how" class="hover:text-ink-fg">{t('landing.nav.how')}</a>
				<a href="#pricing" class="hover:text-ink-fg">{t('landing.nav.pricing')}</a>
			</nav>
			<div class="flex items-center justify-end gap-2 sm:gap-4">
				<div class="flex items-center gap-1 text-[12px] text-ink-muted">
					{#each LOCALES as l (l)}
						<a
							href={localizedHref(l, '/')}
							hreflang={l}
							class={`rounded-md px-1.5 py-0.5 hover:text-ink-fg ${l === locale() ? 'text-ink-fg' : ''}`}
							aria-label={LOCALE_NAMES[l]}
						>
							{l.toUpperCase()}
						</a>
					{/each}
				</div>
				<a
					href={href('/login')}
					class="hidden text-[14px] text-ink-muted hover:text-ink-fg sm:inline"
					>{t('landing.nav.login')}</a
				>
				<Button
					href={href('/register')}
					variant="primary"
					class="!bg-ink-fg !text-ink !shadow-none max-sm:!hidden"
				>
					{t('landing.nav.start')}
				</Button>
			</div>
		</header>

		<div
			class="mx-auto flex max-w-[1240px] flex-col items-center gap-7 px-6 pt-14 pb-16 text-center sm:px-10 sm:pt-20"
		>
			<span
				class="inline-flex animate-rise-in items-center gap-2 rounded-full bg-white/8 py-1.5 pr-4 pl-3 text-[13px] text-ink-fg ring-1 ring-white/10"
			>
				<span class="h-2 w-2 rounded-full bg-accent"></span>
				{t('landing.badge')}
			</span>
			<h1
				class="animate-rise-in text-[52px] leading-[0.98] font-bold tracking-[-0.03em] [animation-delay:80ms] sm:text-[80px] lg:text-[104px]"
			>
				{t('landing.headline1')}<br />
				<span class="text-accent">{t('landing.headline2')} {t('landing.headline3')}</span>
			</h1>
			<p
				class="max-w-xl animate-rise-in text-[17px] leading-relaxed text-ink-muted [animation-delay:160ms] sm:text-[20px]"
			>
				{t('landing.lead')}
			</p>
			<div
				class="flex w-full animate-rise-in flex-wrap items-center justify-center gap-3 [animation-delay:240ms] max-sm:flex-col"
			>
				<Button
					href={href('/register')}
					variant="primary"
					size="lg"
					iconRight="arrowRight"
					class="!px-7 max-sm:w-full"
				>
					{t('landing.cta')}
				</Button>
				<Button
					href={href('/login')}
					variant="outline"
					size="lg"
					class="w-full !border-white/20 !bg-transparent !text-ink-fg sm:!hidden"
				>
					{t('landing.nav.login')}
				</Button>
				<Button
					href="#how"
					variant="outline"
					size="lg"
					class="!border-white/20 !bg-transparent !px-7 !text-ink-fg max-sm:!hidden"
				>
					{t('landing.secondary')}
				</Button>
			</div>
		</div>

		<!-- App preview card -->
		<div class="mx-auto max-w-[1240px] px-6 sm:px-10">
			<div
				class="mx-auto w-full max-w-[760px] animate-rise-in rounded-[24px] bg-surface p-6 text-fg shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5),0_0_0_1px_var(--border)] [animation-delay:320ms] sm:p-9"
			>
				<p class="text-[13px] text-muted">{formatLongDate(todayISO(), locale())}</p>
				<p class="mt-1 text-[24px] font-semibold tracking-tight">{t('common.today')}</p>
				<div class="mt-4 flex flex-col divide-y divide-line">
					{#each [1, 2, 3] as index (index)}
						<div class="flex items-center gap-3.5 px-1 py-3.5">
							<span
								class={`flex h-[22px] w-[22px] items-center justify-center rounded-full border-[1.5px] ${index === 1 ? 'border-accent-line bg-accent' : 'border-border-strong'}`}
							>
								{#if index === 1}<Icon
										name="check"
										size={12}
										strokeWidth={3.2}
										class="text-accent-fg"
									/>{/if}
							</span>
							<span
								class={`text-[15px] font-medium ${index === 1 ? 'text-muted line-through' : 'text-fg'}`}
							>
								{t(`landing.preview.task${index}`)}
							</span>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</section>

	<!-- Features -->
	<section id="features" class="mx-auto max-w-[1240px] px-6 pt-24 pb-16 sm:px-10 sm:pt-32">
		<h2
			class="mx-auto max-w-2xl text-center text-[34px] leading-[1.05] font-bold tracking-[-0.025em] sm:text-[52px]"
		>
			{t('landing.features.title')}
		</h2>
		<dl class="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
			{#each features as feature (feature)}
				<div
					class="flex flex-col gap-3 rounded-[22px] bg-surface p-6 shadow-[0_0_0_1px_var(--border)] transition-transform duration-200 hover:-translate-y-1"
				>
					<span
						class="flex h-11 w-11 items-center justify-center rounded-[13px] bg-accent-soft text-accent-text"
					>
						<Icon name={featureIcons[feature]} size={21} />
					</span>
					<dt class="mt-2 text-[18px] font-semibold tracking-tight">
						{t(`landing.features.${feature}.title`)}
					</dt>
					<dd class="text-[15px] leading-relaxed text-muted">
						{t(`landing.features.${feature}.text`)}
					</dd>
				</div>
			{/each}
		</dl>
	</section>

	<!-- How: one connected block instead of numbered counters -->
	<section id="how" class="mx-auto max-w-[1240px] px-6 py-16 sm:px-10">
		<h2 class="text-[34px] leading-[1.05] font-bold tracking-[-0.025em] sm:text-[48px]">
			{t('landing.how.title')}
		</h2>
		<ol
			class="mt-10 grid overflow-hidden rounded-[24px] bg-surface shadow-[0_0_0_1px_var(--border)] sm:grid-cols-3"
		>
			{#each [1, 2, 3] as step (step)}
				<li
					class={`flex items-center gap-4 p-7 sm:flex-col sm:items-start ${step > 1 ? 'border-line max-sm:border-t sm:border-l' : ''}`}
				>
					<span
						class={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${step === 3 ? 'bg-accent text-accent-fg' : 'bg-surface-2 text-fg'}`}
					>
						<Icon name={stepIcons[step - 1]} size={20} strokeWidth={2.4} />
					</span>
					<span class="text-[18px] font-semibold tracking-tight"
						>{t(`landing.how.step${step}`)}</span
					>
				</li>
			{/each}
		</ol>
	</section>

	<!-- Pricing / closing call to action on ink -->
	<section id="pricing" class="bg-ink text-ink-fg">
		<div
			class="mx-auto flex max-w-[1240px] flex-col items-center gap-6 px-6 pt-24 pb-10 text-center sm:px-10"
		>
			<h2 class="text-[40px] leading-none font-bold tracking-[-0.03em] sm:text-[64px]">
				{t('landing.pricing.title')}
			</h2>
			<p class="max-w-lg text-[17px] text-ink-muted">{t('landing.pricing.text')}</p>
			<Button
				href={href('/register')}
				variant="primary"
				size="lg"
				iconRight="arrowRight"
				class="!px-7"
			>
				{t('landing.cta')}
			</Button>
			<footer
				class="mt-20 flex w-full items-center justify-between border-t border-white/10 pt-6 pb-[env(safe-area-inset-bottom)] text-[13px] text-ink-muted"
			>
				<span>{t('landing.footer')}</span>
				<Logo size={22} showWordmark={false} />
			</footer>
		</div>
	</section>
</div>
