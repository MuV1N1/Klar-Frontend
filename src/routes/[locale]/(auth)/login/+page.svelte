<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	import Button from '#lib/components/ui/Button.svelte';
	import Field from '#lib/components/ui/Field.svelte';
	import Input from '#lib/components/ui/Input.svelte';
	import { DEMO_CREDENTIALS } from '#lib/api/mock/seed.ts';
	import { apiConfig } from '#lib/api/config.ts';
	import { apiErrorCode } from '#lib/api/errors.ts';
	import { localizedHref, useLocale, useTranslations } from '#lib/i18n/index.ts';
	import { auth } from '#lib/stores/auth.svelte.ts';

	const t = useTranslations();
	const locale = useLocale();

	let email = $state('');
	let password = $state('');
	let errors = $state<{ email?: string; password?: string; form?: string }>({});
	let submitting = $state(false);

	function validate() {
		const next: typeof errors = {};
		if (!email.trim()) next.email = t('auth.errors.emailRequired');
		else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = t('auth.errors.emailInvalid');
		if (!password) next.password = t('auth.errors.passwordRequired');
		errors = next;
		return Object.keys(next).length === 0;
	}

	async function submit(credentials = { email, password }) {
		if (!validate()) return;
		submitting = true;
		errors = {};
		try {
			await auth.login(credentials);
			const redirect = page.url.searchParams.get('redirect');
			await goto(redirect?.startsWith('/') ? redirect : localizedHref(locale(), '/app'));
		} catch (error) {
			if (apiErrorCode(error) === 'email_not_verified') {
				await goto(
					`${localizedHref(locale(), '/verify-email')}?email=${encodeURIComponent(credentials.email)}`
				);
				return;
			}
			errors = { form: t('auth.errors.failed') };
		} finally {
			submitting = false;
		}
	}

	function demoLogin() {
		email = DEMO_CREDENTIALS.email;
		password = DEMO_CREDENTIALS.password;
		void submit(DEMO_CREDENTIALS);
	}
</script>

<svelte:head><title>{t('auth.login.action')} – {t('app.name')}</title></svelte:head>

<h1 class="text-[24px] font-semibold tracking-tight text-fg">{t('auth.login.title')}</h1>
<p class="mt-1.5 text-sm text-muted">{t('auth.login.subtitle')}</p>

<form
	class="mt-8 flex flex-col gap-5"
	onsubmit={(event) => {
		event.preventDefault();
		void submit();
	}}
>
	<Field label={t('auth.email')} for="email" error={errors.email}>
		<Input
			id="email"
			type="email"
			autocomplete="email"
			bind:value={email}
			placeholder={t('auth.emailPlaceholder')}
			invalid={!!errors.email}
		/>
	</Field>
	<Field label={t('auth.password')} for="password" error={errors.password}>
		<Input
			id="password"
			type="password"
			autocomplete="current-password"
			bind:value={password}
			placeholder="••••••••"
			invalid={!!errors.password}
		/>
	</Field>

	{#if errors.form}
		<p class="rounded-[12px] bg-danger/10 px-4 py-3 text-[13px] text-danger-text" role="alert">
			{errors.form}
		</p>
	{/if}

	<div class="flex items-center justify-end">
		<a
			href={localizedHref(locale(), '/forgot-password')}
			class="text-[13px] text-muted hover:text-fg"
		>
			{t('auth.login.forgot')}
		</a>
	</div>

	<Button type="submit" variant="primary" size="lg" block loading={submitting}
		>{t('auth.login.action')}</Button
	>

	{#if apiConfig.useMock}
		<Button
			type="button"
			variant="outline"
			size="lg"
			block
			icon="zap"
			onclick={demoLogin}
			disabled={submitting}
		>
			{t('auth.login.demoLogin')}
		</Button>
	{/if}
</form>

<p class="mt-8 text-center text-[13px] text-muted">
	{t('auth.login.noAccount')}
	<a
		href={localizedHref(locale(), '/register')}
		class="font-medium text-accent-text hover:underline"
	>
		{t('auth.login.register')}
	</a>
</p>
