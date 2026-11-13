<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	import Button from '#lib/components/ui/Button.svelte';
	import Field from '#lib/components/ui/Field.svelte';
	import Input from '#lib/components/ui/Input.svelte';
	import { apiErrorCode } from '#lib/api/errors.ts';
	import { localizedHref, useLocale, useTranslations } from '#lib/i18n/index.ts';
	import { auth } from '#lib/stores/auth.svelte.ts';

	const t = useTranslations();
	const locale = useLocale();

	let email = $state(page.url.searchParams.get('email') ?? '');
	let code = $state('');
	let error = $state<string | null>(null);
	let notice = $state<string | null>(null);
	let submitting = $state(false);
	let resending = $state(false);

	const CODE_PATTERN = /^\s*\d{3}\s?\d{3}\s*$/;

	async function submit() {
		if (!email.trim()) {
			error = t('auth.errors.emailRequired');
			return;
		}
		if (!CODE_PATTERN.test(code)) {
			error = t('auth.errors.codeRequired');
			return;
		}
		submitting = true;
		error = null;
		notice = null;
		try {
			await auth.verifyEmail({ email: email.trim(), code: code.replace(/\s/g, '') });
			await goto(localizedHref(locale(), '/app'));
		} catch (err) {
			error =
				apiErrorCode(err) === 'invalid_code'
					? t('auth.errors.codeInvalid')
					: t('auth.errors.failed');
		} finally {
			submitting = false;
		}
	}

	async function resend() {
		if (!email.trim()) {
			error = t('auth.errors.emailRequired');
			return;
		}
		resending = true;
		error = null;
		try {
			await auth.resendVerification(email.trim());
			notice = t('auth.verify.resent');
		} catch {
			error = t('auth.errors.failed');
		} finally {
			resending = false;
		}
	}
</script>

<svelte:head><title>{t('auth.verify.title')} – {t('app.name')}</title></svelte:head>

<h1 class="text-[24px] font-semibold tracking-tight text-fg">{t('auth.verify.title')}</h1>
<p class="mt-1.5 text-sm text-muted">{t('auth.verify.subtitle', { email })}</p>

<form
	class="mt-8 flex flex-col gap-5"
	onsubmit={(event) => {
		event.preventDefault();
		void submit();
	}}
>
	{#if !page.url.searchParams.get('email')}
		<Field label={t('auth.email')} for="email">
			<Input
				id="email"
				type="email"
				autocomplete="email"
				bind:value={email}
				placeholder={t('auth.emailPlaceholder')}
			/>
		</Field>
	{/if}
	<Field label={t('auth.verify.code')} for="code" {error}>
		<Input
			id="code"
			inputmode="numeric"
			autocomplete="one-time-code"
			size="lg"
			class="text-center text-[22px] tracking-[0.3em]"
			bind:value={code}
			placeholder={t('auth.verify.codePlaceholder')}
			invalid={!!error}
			oninput={() => (error = null)}
		/>
	</Field>

	{#if notice}
		<p class="rounded-[12px] bg-surface-2 px-4 py-3 text-[13px] text-fg-2" role="status">
			{notice}
		</p>
	{/if}

	<Button type="submit" variant="primary" size="lg" block loading={submitting}
		>{t('auth.verify.action')}</Button
	>
	<Button type="button" variant="outline" size="lg" block loading={resending} onclick={resend}>
		{t('auth.verify.resend')}
	</Button>
</form>

<p class="mt-8 text-center text-[13px] text-muted">
	{t('auth.verify.wrongEmail')}
	<a
		href={localizedHref(locale(), '/register')}
		class="font-medium text-accent-text hover:underline"
	>
		{t('auth.register.action')}
	</a>
</p>
