<script lang="ts">
	import Button from '#lib/components/ui/Button.svelte';
	import EmptyState from '#lib/components/ui/EmptyState.svelte';
	import ErrorState from '#lib/components/ui/ErrorState.svelte';
	import IconButton from '#lib/components/ui/IconButton.svelte';
	import Input from '#lib/components/ui/Input.svelte';
	import PageHeader from '#lib/components/ui/PageHeader.svelte';
	import Skeleton from '#lib/components/ui/Skeleton.svelte';
	import { useTranslations } from '#lib/i18n/index.ts';
	import { auth } from '#lib/stores/auth.svelte.ts';
	import { groups } from '#lib/stores/groups.svelte.ts';
	import { toasts } from '#lib/stores/toasts.svelte.ts';
	import type { Group, GroupMember } from '#lib/types/index.ts';

	const t = useTranslations();

	let newName = $state('');
	let creating = $state(false);
	/** Invite link per group, shown after "Create link". */
	let links = $state<Record<string, string>>({});
	let emails = $state<Record<string, string>>({});

	async function create() {
		if (!newName.trim()) return;
		creating = true;
		try {
			await groups.create(newName.trim());
			newName = '';
			toasts.success(t('groups.created'));
		} catch {
			toasts.error(t('common.errorGeneric'));
		} finally {
			creating = false;
		}
	}

	async function run(action: () => Promise<unknown>, success: string) {
		try {
			await action();
			toasts.success(success);
		} catch {
			toasts.error(t('common.errorGeneric'));
		}
	}

	function rename(group: Group) {
		const name = prompt(t('groups.rename'), group.name)?.trim();
		if (name && name !== group.name)
			void run(() => groups.rename(group.id, name), t('groups.renamed'));
	}

	function remove(group: Group) {
		if (confirm(t('groups.deleteConfirm', { name: group.name })))
			void run(() => groups.remove(group.id), t('groups.deleted'));
	}

	function removeMember(group: Group, member: GroupMember) {
		const self = member.id === auth.user?.id;
		const question = self
			? t('groups.leaveConfirm', { name: group.name })
			: t('groups.removeConfirm', { name: member.name });
		if (confirm(question))
			void run(
				() => groups.removeMember(group.id, member.id),
				self ? t('groups.left') : t('groups.removed')
			);
	}

	async function createLink(group: Group) {
		try {
			links[group.id] = (await groups.invite(group.id)).url;
		} catch {
			toasts.error(t('common.errorGeneric'));
		}
	}

	async function copyLink(group: Group) {
		try {
			await navigator.clipboard.writeText(links[group.id] ?? '');
			toasts.success(t('groups.linkCopied'));
		} catch {
			toasts.error(t('common.errorGeneric'));
		}
	}

	async function inviteByEmail(group: Group) {
		const email = emails[group.id]?.trim();
		if (!email) return;
		await run(() => groups.invite(group.id, email), t('groups.inviteSent'));
		emails[group.id] = '';
	}
</script>

<svelte:head><title>{t('groups.title')} – {t('app.name')}</title></svelte:head>

<PageHeader
	eyebrow={t('groups.eyebrow')}
	title={t('groups.title')}
	description={t('groups.description')}
/>

<form
	class="mb-6 flex gap-2"
	onsubmit={(event) => {
		event.preventDefault();
		void create();
	}}
>
	<Input
		bind:value={newName}
		placeholder={t('groups.namePlaceholder')}
		aria-label={t('groups.new')}
	/>
	<Button type="submit" variant="primary" icon="plus" loading={creating}>{t('groups.new')}</Button>
</form>

{#if groups.status === 'error'}
	<ErrorState
		title={t('common.errorTitle')}
		message={groups.error?.message ?? t('common.errorGeneric')}
		retryLabel={t('common.retry')}
		onretry={() => void groups.load(true)}
	/>
{:else if groups.isLoading}
	<Skeleton class="h-[180px] rounded-[18px]" />
{:else if groups.items.length === 0}
	<EmptyState icon="users" title={t('groups.empty')} description={t('groups.emptyHint')} />
{:else}
	<div class="flex animate-rise-in flex-col gap-4">
		{#each groups.items as group (group.id)}
			{@const admin = group.role === 'admin'}
			<section class="rounded-[18px] border border-border bg-surface p-5 sm:p-7">
				<div class="flex items-center gap-2">
					<h2 class="min-w-0 flex-1 truncate text-[15px] font-semibold text-fg">{group.name}</h2>
					{#if admin}
						<IconButton icon="pencil" label={t('groups.rename')} onclick={() => rename(group)} />
						<IconButton icon="trash" label={t('groups.delete')} onclick={() => remove(group)} />
					{/if}
				</div>

				<h3 class="section-label mt-5">{t('groups.members')}</h3>
				<ul class="mt-2 flex flex-col">
					{#each group.members as member (member.id)}
						{@const self = member.id === auth.user?.id}
						<li class="flex items-center gap-3 border-b border-border py-2.5 last:border-b-0">
							<span
								class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-3 text-[12px] font-semibold text-fg"
							>
								{member.name.slice(0, 1).toUpperCase()}
							</span>
							<span class="flex min-w-0 flex-1 flex-col">
								<span class="truncate text-[13px] font-medium text-fg">
									{member.name}{self ? ` (${t('groups.you')})` : ''}
								</span>
								<span class="truncate text-[11px] text-muted">{member.email}</span>
							</span>
							{#if member.role === 'admin'}
								<span class="text-[11px] text-muted">{t('groups.admin')}</span>
							{/if}
							{#if self}
								<Button
									size="sm"
									variant="ghost"
									icon="logOut"
									onclick={() => removeMember(group, member)}
								>
									{t('groups.leave')}
								</Button>
							{:else if admin}
								<IconButton
									icon="x"
									label={t('groups.removeMember')}
									onclick={() => removeMember(group, member)}
								/>
							{/if}
						</li>
					{/each}
				</ul>

				<h3 class="section-label mt-5">{t('groups.invite')}</h3>
				<div class="mt-2 flex flex-col gap-3">
					{#if links[group.id]}
						<div class="flex gap-2">
							<Input value={links[group.id]} readonly aria-label={t('groups.inviteLink')} />
							<Button icon="link" onclick={() => copyLink(group)}>{t('groups.copy')}</Button>
						</div>
						<p class="text-[12px] text-muted">{t('groups.linkHint')}</p>
					{:else}
						<Button icon="link" class="self-start" onclick={() => createLink(group)}>
							{t('groups.inviteLink')}
						</Button>
					{/if}
					<form
						class="flex gap-2"
						onsubmit={(event) => {
							event.preventDefault();
							void inviteByEmail(group);
						}}
					>
						<Input
							type="email"
							bind:value={emails[group.id]}
							placeholder={t('groups.emailPlaceholder')}
							aria-label={t('groups.inviteEmail')}
						/>
						<Button type="submit" icon="mail">{t('groups.inviteEmail')}</Button>
					</form>
				</div>
			</section>
		{/each}
	</div>
{/if}
