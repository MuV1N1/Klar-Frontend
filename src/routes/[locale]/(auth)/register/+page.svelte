<script lang="ts">
	import { goto } from '$app/navigation';

	import Button from '#lib/components/ui/Button.svelte';
	import Field from '#lib/components/ui/Field.svelte';
	import Input from '#lib/components/ui/Input.svelte';
	import { ApiError } from '#lib/api/errors.ts';
	import { localizedHref, useLocale, useTranslations } from '#lib/i18n/index.ts';
	import { auth } from '#lib/stores/auth.svelte.ts';

	const t = useTranslations();
	const locale = useLocale();

	let name = $state('');
	let email = $state('');
	let password = $state('');
	let errors = $state<{ name?: string; email?: string; password?: string; form?: string }>({});
	let submitting = $state(false);

	function validate() {
		const next: typeof errors = {};
		if (!name.trim()) next.name = t('auth.errors.nameRequired');
		if (!email.trim()) next.email = t('auth.errors.emailRequired');
		else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = t('auth.errors.emailInvalid');
		if (!password) next.password = t('auth.errors.passwordRequired');
		else if (password.length < 8) next.password = t('auth.errors.passwordShort');
		errors = next;
		return Object.keys(next).length === 0;
	}

	async function submit() {
		if (!validate()) return;
		submitting = true;
		try {
			const result = await auth.register({ name, email, password });
			const target = result.verificationRequired ? '/verify-email' : '/login';
			await goto(
				`${localizedHref(locale(), target)}?email=${encodeURIComponent(result.user.email)}`
			);
		} catch (error) {
			errors = {
				form:
					error instanceof ApiError && error.status === 409
						? t('auth.errors.emailTaken')
						: t('auth.errors.registerFailed')
			};
		} finally {
			submitting = false;
		}
	}
</script>

<svelte:head><title>{t('auth.register.action')} – {t('app.name')}</title></svelte:head>

<h1 class="text-[24px] font-semibold tracking-tight text-fg">{t('auth.register.title')}</h1>
<p class="mt-1.5 text-sm text-muted">{t('auth.register.subtitle')}</p>

<form
	class="mt-8 flex flex-col gap-5"
	onsubmit={(event) => {
		event.preventDefault();
		void submit();
	}}
>
	<Field label={t('auth.name')} for="name" error={errors.name}>
		<Input
			id="name"
			autocomplete="name"
			bind:value={name}
			placeholder={t('auth.namePlaceholder')}
			invalid={!!errors.name}
		/>
	</Field>
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
		>{t('auth.register.action')}</Button
	>
	<p class="text-center text-[12px] text-muted">{t('auth.register.terms')}</p>
</form>

<p class="mt-8 text-center text-[13px] text-muted">
	{t('auth.register.hasAccount')}
	<a href={localizedHref(locale(), '/login')} class="font-medium text-accent-text hover:underline">
		{t('auth.register.login')}
	</a>
</p>
