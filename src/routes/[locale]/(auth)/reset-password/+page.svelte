<script lang="ts">
	import { page } from '$app/state';

	import Button from '#lib/components/ui/Button.svelte';
	import Field from '#lib/components/ui/Field.svelte';
	import Icon from '#lib/components/ui/Icon.svelte';
	import Input from '#lib/components/ui/Input.svelte';
	import { apiErrorCode } from '#lib/api/errors.ts';
	import { localizedHref, useLocale, useTranslations } from '#lib/i18n/index.ts';
	import { auth } from '#lib/stores/auth.svelte.ts';

	const t = useTranslations();
	const locale = useLocale();

	let email = $state(page.url.searchParams.get('email') ?? '');
	let code = $state('');
	let password = $state('');
	let errors = $state<{ email?: string; code?: string; password?: string; form?: string }>({});
	let submitting = $state(false);
	let done = $state(false);

	function validate() {
		const next: typeof errors = {};
		if (!email.trim()) next.email = t('auth.errors.emailRequired');
		else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = t('auth.errors.emailInvalid');
		if (!/^\s*\d{3}\s?\d{3}\s*$/.test(code)) next.code = t('auth.errors.codeRequired');
		if (!password) next.password = t('auth.errors.passwordRequired');
		else if (password.length < 8) next.password = t('auth.errors.passwordShort');
		errors = next;
		return Object.keys(next).length === 0;
	}

	async function submit() {
		if (!validate()) return;
		submitting = true;
		try {
			await auth.resetPassword({ email: email.trim(), code: code.replace(/\s/g, ''), password });
			done = true;
		} catch (err) {
			errors = {
				form:
					apiErrorCode(err) === 'invalid_code'
						? t('auth.errors.codeInvalid')
						: t('auth.errors.failed')
			};
		} finally {
			submitting = false;
		}
	}
</script>

<svelte:head><title>{t('auth.reset.title')} – {t('app.name')}</title></svelte:head>

<h1 class="text-[24px] font-semibold tracking-tight text-fg">{t('auth.reset.title')}</h1>
<p class="mt-1.5 text-sm text-muted">{t('auth.reset.subtitle', { email })}</p>

{#if done}
	<div
		class="mt-8 flex animate-pop-in flex-col items-center gap-3 rounded-[18px] bg-surface-2 px-6 py-8 text-center"
	>
		<span class="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-accent-fg">
			<Icon name="check" size={20} />
		</span>
		<p class="text-sm text-fg-2">{t('auth.reset.done')}</p>
		<Button variant="primary" size="lg" block href={localizedHref(locale(), '/login')}>
			{t('auth.reset.toLogin')}
		</Button>
	</div>
{:else}
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
		<Field label={t('auth.reset.code')} for="code" error={errors.code}>
			<Input
				id="code"
				inputmode="numeric"
				autocomplete="one-time-code"
				bind:value={code}
				placeholder={t('auth.verify.codePlaceholder')}
				invalid={!!errors.code}
			/>
		</Field>
		<Field label={t('auth.reset.newPassword')} for="password" error={errors.password}>
			<Input
				id="password"
				type="password"
				autocomplete="new-password"
				bind:value={password}
				placeholder={t('auth.passwordPlaceholder')}
				invalid={!!errors.password}
			/>
		</Field>

		{#if errors.form}
			<p class="rounded-[12px] bg-danger/10 px-4 py-3 text-[13px] text-danger-text" role="alert">
				{errors.form}
			</p>
		{/if}

		<Button type="submit" variant="primary" size="lg" block loading={submitting}
			>{t('auth.reset.action')}</Button
		>
	</form>
{/if}

<p class="mt-8 text-center text-[13px]">
	<a
		href={localizedHref(locale(), '/login')}
		class="inline-flex items-center gap-1.5 text-muted hover:text-fg"
	>
		<Icon name="arrowLeft" size={14} />
		{t('auth.forgot.backToLogin')}
	</a>
</p>
