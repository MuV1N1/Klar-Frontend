<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	import { api } from '#lib/api/index.ts';
	import Button from '#lib/components/ui/Button.svelte';
	import EmptyState from '#lib/components/ui/EmptyState.svelte';
	import Spinner from '#lib/components/ui/Spinner.svelte';
	import { localizedHref, useLocale, useTranslations } from '#lib/i18n/index.ts';
	import { groups } from '#lib/stores/groups.svelte.ts';
	import { toasts } from '#lib/stores/toasts.svelte.ts';

	const t = useTranslations();
	const locale = useLocale();

	const preview = $derived(api.groups.preview(page.params.token ?? ''));
	let joining = $state(false);

	async function join() {
		joining = true;
		try {
			const group = await groups.accept(page.params.token ?? '');
			toasts.success(t('groups.joined', { group: group.name }));
			await goto(localizedHref(locale(), '/app/groups'));
		} catch {
			toasts.error(t('common.errorGeneric'));
		} finally {
			joining = false;
		}
	}
</script>

<svelte:head><title>{t('groups.inviteTitle')} – {t('app.name')}</title></svelte:head>

{#await preview}
	<div class="flex justify-center py-16"><Spinner size={20} class="text-muted" /></div>
{:then invite}
	<EmptyState
		icon="users"
		title={invite.groupName}
		description={invite.alreadyMember
			? t('groups.alreadyMember')
			: invite.invitedBy
				? t('groups.inviteText', { name: invite.invitedBy, group: invite.groupName })
				: t('groups.inviteTextAnonymous', { group: invite.groupName })}
	>
		{#if invite.alreadyMember}
			<Button href={localizedHref(locale(), '/app/groups')}>{t('groups.toGroups')}</Button>
		{:else}
			<Button variant="primary" icon="users" loading={joining} onclick={join}
				>{t('groups.join')}</Button
			>
		{/if}
	</EmptyState>
{:catch}
	<EmptyState icon="users" title={t('groups.inviteTitle')} description={t('groups.inviteInvalid')}>
		<Button href={localizedHref(locale(), '/app/groups')}>{t('groups.toGroups')}</Button>
	</EmptyState>
{/await}
