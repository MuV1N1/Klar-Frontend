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
	import { CATEGORY_COLORS } from '#lib/shopping/catalog.ts';
	import { LIST_COLOR_VALUES } from '#lib/types/index.ts';
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

	// "capture" is the large card with a live quick-add; the other three sit beside it
	const smallFeatures = [
		{ key: 'plan', icon: 'calendar', color: LIST_COLOR_VALUES.orange },
		{ key: 'lists', icon: 'users', color: LIST_COLOR_VALUES.pink },
		{ key: 'focus', icon: 'clock', color: LIST_COLOR_VALUES.purple }
	] as const;
	const steps = [
		{ step: 1, color: LIST_COLOR_VALUES.blue },
		{ step: 2, color: LIST_COLOR_VALUES.orange },
		{ step: 3, color: LIST_COLOR_VALUES.lime }
	] as const;
	const previewTasks = [
		{ index: 1, done: true, color: LIST_COLOR_VALUES.blue },
		{ index: 2, done: false, color: LIST_COLOR_VALUES.teal },
		{ index: 3, done: false, color: LIST_COLOR_VALUES.orange }
	] as const;
</script>

<svelte:head>
	<title>{t('app.name')} – {t('app.tagline')}</title>
</svelte:head>

<div class="min-h-dvh bg-surface text-fg">
	<!-- Hero on the sky band: headline left, the app itself on the right -->
	<section class="overflow-hidden bg-ink pt-[env(safe-area-inset-top)] text-ink-fg">
		<header class="mx-auto flex h-[72px] max-w-[1200px] items-center gap-8 px-4 sm:px-8">
			<Logo size={32} />
			<nav class="hidden flex-1 items-center gap-6 text-[14px] text-ink-muted md:flex">
				<a href="#features" class="hover:text-ink-fg">{t('landing.nav.features')}</a>
				<a href="#how" class="hover:text-ink-fg">{t('landing.nav.how')}</a>
				<a href="#pricing" class="hover:text-ink-fg">{t('landing.nav.pricing')}</a>
			</nav>
			<div class="ml-auto flex items-center gap-4 sm:gap-5">
				<div class="flex items-center gap-1 text-[12px] text-ink-muted">
					{#each LOCALES as l (l)}
						<a
							href={localizedHref(l, '/')}
							hreflang={l}
							class={`rounded-md px-1.5 py-0.5 hover:text-ink-fg ${l === locale() ? 'text-ink-fg' : ''}`}
							aria-label={LOCALE_NAMES[l]}
						>
							{l}
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
					size="sm"
					class="!bg-ink-fg !text-ink !shadow-[0_2px_0_var(--edge)] max-sm:!hidden"
				>
					{t('landing.nav.start')}
				</Button>
			</div>
		</header>

		<div
			class="mx-auto grid max-w-[1200px] animate-rise-in items-center gap-12 px-4 pt-12 sm:px-8 lg:grid-cols-[1fr_1fr] lg:gap-16 lg:pt-16"
		>
			<div class="flex flex-col gap-6 lg:pb-20">
				<h1
					class="font-display text-[44px] leading-[1] font-extrabold tracking-[-0.04em] text-balance sm:text-[60px] xl:text-[68px]"
				>
					{t('landing.headline1')}
					<mark
						class="rounded-[0.18em] bg-[color-mix(in_srgb,#ffd23f_75%,var(--surface))] box-decoration-clone px-[0.12em] whitespace-nowrap text-fg"
						>{t('landing.headline2')}</mark
					>
					{t('landing.headline3')}
				</h1>
				<p class="max-w-[30rem] text-[17px] leading-[1.55] text-ink-muted sm:text-[19px]">
					{t('landing.lead')}
				</p>
				<div class="flex flex-wrap gap-3 max-sm:flex-col">
					<Button
						href={href('/register')}
						variant="primary"
						size="lg"
						iconRight="arrowRight"
						class="max-sm:w-full"
					>
						{t('landing.cta')}
					</Button>
					<Button href={href('/login')} variant="outline" size="lg" class="max-sm:w-full">
						{t('landing.nav.login')}
					</Button>
				</div>
				<p class="text-[13px] text-ink-muted">{t('landing.pricing.text')}</p>
			</div>

			<!-- App preview rising from the bottom edge, with a running focus timer and two shopping items -->
			<div class="relative self-end lg:-mr-16" aria-hidden="true">
				<div
					class="rounded-t-[20px] bg-surface p-5 pb-8 text-fg shadow-[0_0_0_1px_var(--ink-line)] sm:p-8 sm:pb-44"
				>
					<p class="text-[13px] text-muted">{formatLongDate(todayISO(), locale())}</p>
					<p class="font-display text-[28px] font-bold tracking-tight">{t('common.today')}</p>
					<div class="mt-4 flex flex-col divide-y divide-line">
						{#each previewTasks as task (task.index)}
							<div class="flex items-center gap-3.5 py-3.5">
								<span
									class="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border-2"
									style={task.done
										? `background:${task.color};border-color:${task.color}`
										: 'border-color:var(--border-strong)'}
								>
									{#if task.done}<Icon
											name="check"
											size={12}
											strokeWidth={3.2}
											class="text-surface"
										/>{/if}
								</span>
								<span
									class={`flex-1 text-[15px] font-medium ${task.done ? 'text-muted line-through' : ''}`}
								>
									{t(`landing.preview.task${task.index}`)}
								</span>
								<span class="h-2.5 w-2.5 rounded-[3px]" style={`background:${task.color}`}></span>
							</div>
						{/each}
					</div>
				</div>

				<div
					class="fill-card absolute -top-12 right-8 hidden w-[156px] rounded-[20px] p-4 sm:block"
					style={`--c:${CATEGORY_COLORS.dairy}`}
				>
					<span
						class="absolute -top-2 -right-1.5 flex h-7 min-w-9 items-center justify-center rounded-full bg-fg px-2 font-display text-[14px] font-bold text-surface"
						>2×</span
					>
					<p class="font-display text-[18px] font-bold text-fg">{t('landing.preview.item1')}</p>
					<p class="mt-4 text-[12px] text-fg-2">{t('shopping.categories.dairy')}</p>
				</div>
				<div
					class="absolute bottom-6 -left-6 hidden w-[240px] rounded-[18px] bg-fg p-4 text-surface shadow-[0_3px_0_var(--edge)] sm:block"
				>
					<p class="text-[12px] opacity-70">{t('focus.title')}</p>
					<p class="text-[14px]">{t('landing.preview.task2')}</p>
					<p class="mt-3 font-display text-[34px] leading-none font-bold tabular-nums">18:42</p>
					<div class="mt-3 h-1 overflow-hidden rounded-full bg-surface/20">
						<div class="h-full w-[38%] rounded-full bg-accent"></div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Features: one large card you can read the product from, three small ones beside it -->
	<section id="features" class="mx-auto max-w-[1200px] px-4 pt-20 sm:px-8 sm:pt-28">
		<h2 class="font-display text-[32px] leading-[1.05] font-bold tracking-[-0.03em] sm:text-[48px]">
			{t('landing.features.title')}
		</h2>
		<div class="mt-10 grid gap-3 lg:grid-cols-[7fr_5fr]">
			<div class="flex flex-col gap-6 rounded-[24px] bg-ink p-6 text-ink-fg sm:p-8 lg:row-span-3">
				<div>
					<h3 class="font-display text-[22px] font-bold">{t('landing.features.capture.title')}</h3>
					<p class="mt-1.5 text-[15px] leading-relaxed text-ink-muted">
						{t('landing.features.capture.text')}
					</p>
				</div>
				<div
					class="mt-auto flex flex-col divide-y divide-line rounded-[14px] bg-surface px-4 text-fg shadow-[0_3px_0_var(--edge)]"
					aria-hidden="true"
				>
					{#each [1, 2] as index (index)}
						<div class="flex items-center gap-3 py-3 text-[15px]">
							<span class="h-[18px] w-[18px] rounded-full border-2 border-border-strong"></span>
							{t(`landing.preview.task${index}`)}
						</div>
					{/each}
				</div>
				<div
					class="flex items-center gap-3 rounded-[14px] bg-surface px-4 py-3 text-fg shadow-[0_3px_0_var(--edge)]"
					aria-hidden="true"
				>
					<Icon name="plus" size={16} class="text-muted" />
					<span class="flex-1 text-[15px]">{t('landing.preview.task3')}</span>
					<kbd class="rounded-[5px] bg-surface-2 px-1.5 py-0.5 font-sans text-[11px] text-muted"
						>Enter</kbd
					>
				</div>
			</div>
			{#each smallFeatures as feature (feature.key)}
				<div
					class="fill-card flex items-start gap-4 rounded-[24px] p-6 shadow-none!"
					style={`--c:${feature.color}`}
				>
					<span
						class="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-surface"
						style={`color:${feature.color}`}
					>
						<Icon name={feature.icon} size={18} />
					</span>
					<div>
						<h3 class="font-display text-[19px] font-bold">
							{t(`landing.features.${feature.key}.title`)}
						</h3>
						<p class="mt-1 text-[15px] leading-relaxed text-fg-2">
							{t(`landing.features.${feature.key}.text`)}
						</p>
					</div>
				</div>
			{/each}
		</div>
	</section>

	<!-- How: three real steps, so they are numbered -->
	<section id="how" class="mx-auto max-w-[1200px] px-4 pt-20 sm:px-8 sm:pt-28">
		<h2 class="font-display text-[32px] leading-[1.05] font-bold tracking-[-0.03em] sm:text-[48px]">
			{t('landing.how.title')}
		</h2>
		<ol class="mt-10 grid gap-8 border-t border-line pt-8 sm:grid-cols-3 sm:gap-6">
			{#each steps as { step, color } (step)}
				<li class="flex flex-col gap-3">
					<span
						class="fill-card flex h-9 w-9 items-center justify-center rounded-full font-display text-[16px] font-bold shadow-none!"
						style={`--c:${color}`}>{step}</span
					>
					<span class="font-display text-[20px] font-bold tracking-tight"
						>{t(`landing.how.step${step}`)}</span
					>
				</li>
			{/each}
		</ol>
	</section>

	<!-- Pricing / closing call to action on the sky band -->
	<section id="pricing" class="mt-20 bg-ink text-ink-fg sm:mt-28">
		<div class="mx-auto max-w-[1200px] px-4 pt-20 pb-8 sm:px-8 sm:pt-24">
			<div class="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
				<div>
					<h2
						class="max-w-[16ch] font-display text-[38px] leading-[1.02] font-extrabold tracking-[-0.04em] sm:text-[56px]"
					>
						{t('landing.pricing.title')}
					</h2>
					<p class="mt-4 text-[17px] text-ink-muted">{t('landing.pricing.text')}</p>
				</div>
				<Button href={href('/register')} variant="primary" size="lg" iconRight="arrowRight">
					{t('landing.cta')}
				</Button>
			</div>
			<footer
				class="mt-20 flex items-center justify-between border-t border-ink-line pt-6 pb-[env(safe-area-inset-bottom)] text-[13px] text-ink-muted"
			>
				<span>{t('landing.footer')}</span>
				<Logo size={22} showWordmark={false} />
			</footer>
		</div>
	</section>
</div>
