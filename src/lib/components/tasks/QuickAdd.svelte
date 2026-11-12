<script lang="ts">
	import { useTranslations } from '#lib/i18n/index.ts';
	import { settings } from '#lib/stores/settings.svelte.ts';
	import { tasks } from '#lib/stores/tasks.svelte.ts';
	import { toasts } from '#lib/stores/toasts.svelte.ts';
	import { ui } from '#lib/stores/ui.svelte.ts';
	import type { CreateTaskInput } from '#lib/types/index.ts';

	import Button from '../ui/Button.svelte';
	import Icon from '../ui/Icon.svelte';
	import Spinner from '../ui/Spinner.svelte';

	interface Props {
		placeholder: string;
		/** Pre-filled values for the created task (e.g. today's date or a list id). */
		defaults?: Partial<CreateTaskInput>;
		/** 'plus' shows the lime plus circle (Figma "Heute"), 'button' shows an explicit button (Figma "Posteingang"). */
		variant?: 'plus' | 'button';
	}

	let { placeholder, defaults = {}, variant = 'plus' }: Props = $props();

	const t = useTranslations();

	let title = $state('');
	let submitting = $state(false);

	async function submit() {
		const trimmed = title.trim();
		if (!trimmed || submitting) return;
		submitting = true;
		try {
			await tasks.create({
				priority: settings.value.defaultPriority,
				listId: settings.value.defaultListId,
				...defaults,
				title: trimmed
			});
			title = '';
			toasts.success(t('tasks.created'));
		} catch {
			toasts.error(t('common.errorGeneric'));
		} finally {
			submitting = false;
		}
	}

	function openDetails() {
		ui.openNewTask({ ...defaults, title: title.trim() || undefined });
		title = '';
	}
</script>

<form
	onsubmit={(event) => {
		event.preventDefault();
		void submit();
	}}
	class="group flex items-center gap-3 rounded-[18px] border border-border bg-surface py-2.5 pr-2.5 pl-3 transition-colors focus-within:border-border-strong hover:border-border-strong sm:gap-4 sm:py-3 sm:pr-3 sm:pl-5"
>
	{#if variant === 'plus'}
		<button
			type="button"
			aria-label={t('navigation.newTask')}
			title={t('navigation.newTask')}
			onclick={openDetails}
			class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-accent-fg shadow-[inset_0_0_0_1px_var(--accent-line)] transition-transform hover:scale-105 active:scale-95"
		>
			{#if submitting}<Spinner size={16} />{:else}<Icon
					name="plus"
					size={18}
					strokeWidth={2.5}
				/>{/if}
		</button>
	{:else}
		<span class="text-muted"><Icon name="plus" size={16} /></span>
	{/if}

	<input
		type="text"
		bind:value={title}
		{placeholder}
		aria-label={placeholder}
		enterkeyhint="done"
		class="min-w-0 flex-1 bg-transparent text-sm text-fg placeholder:text-muted focus:outline-none"
	/>

	{#if variant === 'button'}
		<Button type="submit" variant="primary" size="md" loading={submitting}>
			{t('common.add')}
		</Button>
	{:else if title.trim()}
		<span class="hidden text-[11px] text-muted sm:inline">{t('tasks.quickAddHint')}</span>
		<Button type="button" variant="ghost" size="sm" onclick={openDetails}>
			{t('common.edit')}
		</Button>
	{/if}
</form>
