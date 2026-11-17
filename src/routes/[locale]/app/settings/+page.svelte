<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	import Button from '#lib/components/ui/Button.svelte';
	import Field from '#lib/components/ui/Field.svelte';
	import Icon from '#lib/components/ui/Icon.svelte';
	import type { IconName } from '#lib/components/ui/icons.ts';
	import Input from '#lib/components/ui/Input.svelte';
	import PageHeader from '#lib/components/ui/PageHeader.svelte';
	import Select from '#lib/components/ui/Select.svelte';
	import Toggle from '#lib/components/ui/Toggle.svelte';
	import ReminderEditor from '#lib/components/calendar/ReminderEditor.svelte';
	import {
		LOCALES,
		LOCALE_NAMES,
		localizedHref,
		switchLocaleInPath,
		useLocale,
		useTranslations
	} from '#lib/i18n/index.ts';
	import { auth } from '#lib/stores/auth.svelte.ts';
	import { calendar } from '#lib/stores/calendar.svelte.ts';
	import { groups } from '#lib/stores/groups.svelte.ts';
	import { lists } from '#lib/stores/lists.svelte.ts';
	import { notifications } from '#lib/stores/notifications.svelte.ts';
	import { focusTimer } from '#lib/stores/focus.svelte.ts';
	import { FOCUS_MINUTES, settings, type Theme } from '#lib/stores/settings.svelte.ts';
	import { tasks } from '#lib/stores/tasks.svelte.ts';
	import { toasts } from '#lib/stores/toasts.svelte.ts';
	import { TASK_PRIORITIES, type Reminder, type TaskPriority } from '#lib/types/index.ts';

	const t = useTranslations();
	const locale = useLocale();

	const themes: { value: Theme; icon: IconName }[] = [
		{ value: 'light', icon: 'sun' },
		{ value: 'dark', icon: 'moon' },
		{ value: 'system', icon: 'monitor' }
	];

	// Profile form
	let name = $state('');
	let email = $state('');
	let savingProfile = $state(false);

	$effect(() => {
		name = auth.user?.name ?? '';
		email = auth.user?.email ?? '';
	});

	async function saveProfile() {
		if (!name.trim()) return;
		savingProfile = true;
		try {
			await auth.updateProfile({ name: name.trim(), email: email.trim() });
			toasts.success(t('settings.profile.saved'));
		} catch {
			toasts.error(t('common.errorGeneric'));
		} finally {
			savingProfile = false;
		}
	}

	const listOptions = $derived([
		{ value: '', label: t('tasks.noList') },
		...lists.items.map((l) => ({ value: l.id, label: l.name }))
	]);
	const priorityOptions = TASK_PRIORITIES.map((p) => ({
		value: p,
		label: t(`tasks.priorities.${p}`)
	}));
	const weekOptions = $derived([
		{ value: 'monday', label: t('settings.tasks.monday') },
		{ value: 'sunday', label: t('settings.tasks.sunday') }
	]);
	const focusOptions = $derived(
		// A custom length from the focus page is offered too
		[...new Set([...FOCUS_MINUTES, settings.value.focusMinutes])]
			.sort((a, b) => a - b)
			.map((m) => ({ value: String(m), label: t('focus.minutes', { count: m }) }))
	);

	// Notifications
	let pushBusy = $state(false);

	async function togglePush(enable: boolean) {
		pushBusy = true;
		try {
			const state = enable
				? await notifications.enablePush()
				: (await notifications.disablePush(), 'off');
			if (enable && state === 'on') toasts.success(t('settings.notifications.pushEnabled'));
			if (enable && state === 'denied') toasts.error(t('settings.notifications.pushDenied'));
		} catch {
			toasts.error(t('common.errorGeneric'));
		} finally {
			pushBusy = false;
		}
	}

	async function testPush() {
		try {
			const delivered = await notifications.testPush();
			if (delivered > 0) toasts.success(t('settings.notifications.testSent', { count: delivered }));
			else toasts.error(t('settings.notifications.testFailed'));
		} catch {
			toasts.error(t('common.errorGeneric'));
		}
	}

	let saveTimer: ReturnType<typeof setTimeout> | undefined;
	/** Saved shortly after the last change, so quick edits become one request. */
	function saveDefaults(allDay: boolean, reminders: Reminder[]) {
		clearTimeout(saveTimer);
		saveTimer = setTimeout(async () => {
			try {
				await notifications.updateDefaults(allDay, reminders);
				toasts.success(t('settings.saved'));
			} catch {
				toasts.error(t('common.errorGeneric'));
			}
		}, 600);
	}

	let timedDefaults = $state<Reminder[]>([]);
	let allDayDefaults = $state<Reminder[]>([]);
	$effect(() => {
		const current = notifications.settings;
		if (current) {
			timedDefaults = current.eventReminders;
			allDayDefaults = current.allDayEventReminders;
		}
	});

	async function logout() {
		// Before logging out: unsubscribing this device needs the session.
		await notifications.reset();
		await auth.logout();
		tasks.reset();
		focusTimer.reset();
		lists.reset();
		groups.reset();
		calendar.reset();
		await goto(localizedHref(locale(), '/login'));
	}
</script>

<svelte:head><title>{t('settings.title')} – {t('app.name')}</title></svelte:head>

<PageHeader eyebrow={t('settings.eyebrow')} title={t('settings.title')} />

<div class="flex animate-rise-in flex-col gap-6">
	<!-- Appearance -->
	<section class="rounded-[18px] border border-border bg-surface p-5 sm:p-7">
		<h2 class="text-[15px] font-semibold text-fg">{t('settings.appearance.title')}</h2>
		<p class="mt-1 text-[13px] text-muted">{t('settings.appearance.description')}</p>
		<div
			class="mt-5 grid grid-cols-3 gap-2"
			role="radiogroup"
			aria-label={t('settings.appearance.theme')}
		>
			{#each themes as theme (theme.value)}
				<button
					type="button"
					role="radio"
					aria-checked={settings.theme === theme.value}
					onclick={() => settings.setTheme(theme.value)}
					class={`flex flex-col items-center gap-2 rounded-[14px] border px-3 py-4 text-[13px] transition-colors ${
						settings.theme === theme.value
							? 'border-accent-line bg-accent-soft text-fg'
							: 'border-border bg-surface-2 text-muted hover:text-fg'
					}`}
				>
					<Icon name={theme.icon} size={18} />
					{t(`settings.appearance.${theme.value}`)}
				</button>
			{/each}
		</div>
	</section>

	<!-- Language -->
	<section class="rounded-[18px] border border-border bg-surface p-5 sm:p-7">
		<h2 class="text-[15px] font-semibold text-fg">{t('settings.language.title')}</h2>
		<p class="mt-1 text-[13px] text-muted">{t('settings.language.description')}</p>
		<div
			class="mt-5 grid grid-cols-2 gap-2"
			role="radiogroup"
			aria-label={t('settings.language.title')}
		>
			{#each LOCALES as l (l)}
				<a
					href={switchLocaleInPath(page.url.pathname, l)}
					hreflang={l}
					role="radio"
					aria-checked={locale() === l}
					data-sveltekit-reload
					class={`flex items-center justify-center gap-2 rounded-[14px] border px-3 py-3.5 text-[13px] transition-colors ${
						locale() === l
							? 'border-accent-line bg-accent-soft text-fg'
							: 'border-border bg-surface-2 text-muted hover:text-fg'
					}`}
				>
					<Icon name="globe" size={16} />
					{LOCALE_NAMES[l]}
				</a>
			{/each}
		</div>
	</section>

	<!-- Profile -->
	<section class="rounded-[18px] border border-border bg-surface p-5 sm:p-7">
		<h2 class="text-[15px] font-semibold text-fg">{t('settings.profile.title')}</h2>
		<p class="mt-1 text-[13px] text-muted">{t('settings.profile.description')}</p>
		<form
			class="mt-5 flex flex-col gap-5"
			onsubmit={(event) => {
				event.preventDefault();
				void saveProfile();
			}}
		>
			<div class="grid gap-5 sm:grid-cols-2">
				<Field label={t('settings.profile.name')} for="profile-name">
					<Input id="profile-name" bind:value={name} autocomplete="name" />
				</Field>
				<Field label={t('settings.profile.email')} for="profile-email">
					<Input id="profile-email" type="email" bind:value={email} autocomplete="email" />
				</Field>
			</div>
			<div class="flex flex-wrap items-center justify-between gap-3">
				<Button type="submit" variant="primary" loading={savingProfile} class="ml-auto"
					>{t('settings.profile.save')}</Button
				>
			</div>
		</form>
	</section>

	<!-- Task behaviour -->
	<section class="rounded-[18px] border border-border bg-surface p-5 sm:p-7">
		<h2 class="text-[15px] font-semibold text-fg">{t('settings.tasks.title')}</h2>
		<p class="mt-1 text-[13px] text-muted">{t('settings.tasks.description')}</p>
		<div class="mt-5 grid gap-5 sm:grid-cols-2">
			<Field label={t('settings.tasks.defaultList')} for="default-list">
				<Select
					id="default-list"
					value={settings.value.defaultListId ?? ''}
					options={listOptions}
					onchange={(e) => settings.update({ defaultListId: e.currentTarget.value || null })}
				/>
			</Field>
			<Field label={t('settings.tasks.defaultPriority')} for="default-priority">
				<Select
					id="default-priority"
					value={settings.value.defaultPriority}
					options={priorityOptions}
					onchange={(e) =>
						settings.update({ defaultPriority: e.currentTarget.value as TaskPriority })}
				/>
			</Field>
			<Field label={t('settings.tasks.weekStart')} for="week-start">
				<Select
					id="week-start"
					value={settings.value.weekStart}
					options={weekOptions}
					onchange={(e) =>
						settings.update({ weekStart: e.currentTarget.value as 'monday' | 'sunday' })}
				/>
			</Field>
		</div>
		<div class="mt-4 flex flex-col divide-y divide-border">
			<Toggle
				checked={settings.value.showCompletedOnDashboard}
				label={t('settings.tasks.showCompleted')}
				onchange={(checked) => settings.update({ showCompletedOnDashboard: checked })}
			/>
			<Toggle
				checked={settings.value.confirmDelete}
				label={t('settings.tasks.confirmDelete')}
				onchange={(checked) => settings.update({ confirmDelete: checked })}
			/>
		</div>
	</section>

	<!-- Notifications -->
	<section class="rounded-[18px] border border-border bg-surface p-5 sm:p-7">
		<h2 class="text-[15px] font-semibold text-fg">{t('settings.notifications.title')}</h2>
		<p class="mt-1 text-[13px] text-muted">{t('settings.notifications.description')}</p>

		<div class="mt-5 flex flex-col gap-3 rounded-[14px] bg-surface-2 p-4">
			<div class="flex flex-wrap items-center justify-between gap-3">
				<span class="flex min-w-0 flex-col gap-0.5">
					<span class="text-sm font-medium text-fg">{t('settings.notifications.push')}</span>
					<span class="text-[12px] text-muted"
						>{t(`settings.notifications.pushState.${notifications.push}`)}</span
					>
				</span>
				<div class="flex items-center gap-2">
					{#if notifications.push === 'on'}
						<Button size="sm" variant="ghost" onclick={testPush}
							>{t('settings.notifications.test')}</Button
						>
						<Button size="sm" variant="outline" loading={pushBusy} onclick={() => togglePush(false)}
							>{t('settings.notifications.disable')}</Button
						>
					{:else if notifications.push === 'off'}
						<Button
							size="sm"
							variant="primary"
							icon="bell"
							loading={pushBusy}
							onclick={() => togglePush(true)}>{t('settings.notifications.enable')}</Button
						>
					{/if}
				</div>
			</div>
			<p class="text-[12px] text-muted">{t('settings.notifications.fallback')}</p>
		</div>

		{#if notifications.settings}
			<div class="mt-6 grid gap-6 sm:grid-cols-2 sm:gap-x-8">
				<Field label={t('settings.notifications.timedDefaults')}>
					<ReminderEditor
						bind:reminders={timedDefaults}
						allDay={false}
						id="default-timed"
						onchange={() => saveDefaults(false, timedDefaults)}
					/>
				</Field>
				<Field label={t('settings.notifications.allDayDefaults')}>
					<ReminderEditor
						bind:reminders={allDayDefaults}
						allDay={true}
						id="default-all-day"
						onchange={() => saveDefaults(true, allDayDefaults)}
					/>
				</Field>
			</div>
			<p class="mt-4 text-[12px] text-muted">
				{t('settings.notifications.timeZone', { zone: notifications.settings.timeZone })}
			</p>
		{/if}
	</section>

	<!-- Focus -->
	<section class="rounded-[18px] border border-border bg-surface p-5 sm:p-7">
		<h2 class="text-[15px] font-semibold text-fg">{t('settings.focus.title')}</h2>
		<p class="mt-1 text-[13px] text-muted">{t('settings.focus.description')}</p>
		<div class="mt-5 sm:max-w-xs">
			<Field label={t('settings.focus.duration')} for="focus-duration">
				<Select
					id="focus-duration"
					value={String(settings.value.focusMinutes)}
					options={focusOptions}
					onchange={(e) => settings.update({ focusMinutes: Number(e.currentTarget.value) })}
				/>
			</Field>
		</div>
	</section>

	{#if auth.user?.role === 'admin'}
		<!-- Admin (also the way in on phones, where the sidebar is not visible) -->
		<section class="rounded-[18px] border border-border bg-surface p-5 sm:p-7">
			<h2 class="text-[15px] font-semibold text-fg">{t('settings.admin.title')}</h2>
			<p class="mt-1 text-[13px] text-muted">{t('settings.admin.description')}</p>
			<div class="mt-5">
				<Button variant="outline" icon="shield" href={localizedHref(locale(), '/app/admin')}>
					{t('settings.admin.open')}
				</Button>
			</div>
		</section>
	{/if}

	<!-- Data -->
	<section class="rounded-[18px] border border-border bg-surface p-5 sm:p-7">
		<h2 class="text-[15px] font-semibold text-fg">{t('settings.data.title')}</h2>
		<p class="mt-1 text-[13px] text-muted">{t('settings.data.description')}</p>
		<div class="mt-5 flex flex-wrap gap-2">
			<Button variant="danger" icon="logOut" onclick={logout}>{t('settings.data.logout')}</Button>
		</div>
	</section>
</div>
