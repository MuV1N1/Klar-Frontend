<script lang="ts">
	import Button from '#lib/components/ui/Button.svelte';
	import Field from '#lib/components/ui/Field.svelte';
	import Icon from '#lib/components/ui/Icon.svelte';
	import Input from '#lib/components/ui/Input.svelte';
	import { localizedHref, useLocale, useTranslations } from '#lib/i18n/index.ts';
	import { auth } from '#lib/stores/auth.svelte.ts';

	const t = useTranslations();
	const locale = useLocale();

	let email = $state('');
	let error = $state<string | null>(null);
	let submitting = $state(false);
	let sent = $state(false);

	async function submit() {
		if (!email.trim()) {
			error = t('auth.errors.emailRequired');
			return;
		}
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			error = t('auth.errors.emailInvalid');
			return;
		}
		submitting = true;
		error = null;
		try {
			await auth.forgotPassword(email);
			sent = true;
		} catch {
			error = t('auth.errors.failed');
		} finally {
			submitting = false;
		}
	}
</script>

<svelte:head><title>{t('auth.forgot.title')} – {t('app.name')}</title></svelte:head>

<h1 class="text-[24px] font-semibold tracking-tight text-fg">{t('auth.forgot.title')}</h1>
<p class="mt-1.5 text-sm text-muted">{t('auth.forgot.subtitle')}</p>

{#if sent}
	<div
		class="mt-8 flex animate-pop-in flex-col items-center gap-3 rounded-[18px] bg-surface-2 px-6 py-8 text-center"
	>
		<span class="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-accent-fg">
			<Icon name="mail" size={20} />
		</span>
		<p class="text-sm text-fg-2">{t('auth.forgot.sent', { email })}</p>
	</div>
{:else}
	<form
		class="mt-8 flex flex-col gap-5"
		onsubmit={(event) => {
			event.preventDefault();
			void submit();
		}}
	>
		<Field label={t('auth.email')} for="email" {error}>
			<Input
				id="email"
				type="email"
				autocomplete="email"
				bind:value={email}
				placeholder={t('auth.emailPlaceholder')}
				invalid={!!error}
				oninput={() => (error = null)}
			/>
		</Field>
		<Button type="submit" variant="primary" size="lg" block loading={submitting}
			>{t('auth.forgot.action')}</Button
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
