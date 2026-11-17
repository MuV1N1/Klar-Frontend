<script lang="ts">
	import { useLocale, useTranslations } from '#lib/i18n/index.ts';
	import { auth } from '#lib/stores/auth.svelte.ts';
	import { groups } from '#lib/stores/groups.svelte.ts';
	import { lists } from '#lib/stores/lists.svelte.ts';
	import { toasts } from '#lib/stores/toasts.svelte.ts';
	import { ui } from '#lib/stores/ui.svelte.ts';
	import { LIST_ICONS, type ListColor, type ListIcon } from '#lib/types/index.ts';

	import Button from '../ui/Button.svelte';
	import ColorPicker from '../ui/ColorPicker.svelte';
	import Dialog from '../ui/Dialog.svelte';
	import Field from '../ui/Field.svelte';
	import Icon from '../ui/Icon.svelte';
	import Input from '../ui/Input.svelte';
	import Select from '../ui/Select.svelte';
	import Textarea from '../ui/Textarea.svelte';
	import { deleteList } from './listActions.ts';
	import { listIconName } from './listHelpers.ts';

	const t = useTranslations();
	const locale = useLocale();

	const dialog = $derived(ui.listDialog);
	const editing = $derived(dialog.list);
	const shopping = $derived(dialog.kind === 'shopping');

	let name = $state('');
	let description = $state('');
	let color = $state<ListColor>('lime');
	let icon = $state<ListIcon>('list');
	/** '' = private. */
	let groupId = $state('');
	let error = $state<string | null>(null);
	let saving = $state(false);
	let nameInput = $state<HTMLInputElement | null>(null);

	$effect(() => {
		if (!dialog.open) return;
		name = dialog.list?.name ?? '';
		description = dialog.list?.description ?? '';
		color = dialog.list?.color ?? 'lime';
		icon = dialog.list?.icon ?? (dialog.kind === 'shopping' ? 'cart' : 'list');
		groupId = dialog.list?.groupId ?? '';
		error = null;
		setTimeout(() => nameInput?.focus(), 30);
	});

	const shareOptions = $derived([
		{ value: '', label: t('groups.private') },
		...groups.items.map((g) => ({ value: g.id, label: g.name }))
	]);
	const canShare = $derived(!editing || editing.createdBy === auth.user?.id);

	async function submit() {
		if (!name.trim()) {
			error = t('lists.nameRequired');
			nameInput?.focus();
			return;
		}
		saving = true;
		const input = {
			name: name.trim(),
			description: description.trim() || null,
			color,
			icon,
			groupId: groupId || null
		};
		try {
			if (editing) {
				await lists.update(editing.id, input);
				toasts.success(t('lists.updated'));
			} else {
				await lists.create({ ...input, kind: dialog.kind });
				toasts.success(t('lists.created'));
			}
			ui.closeListDialog();
		} catch {
			toasts.error(t('common.errorGeneric'));
		} finally {
			saving = false;
		}
	}

	async function remove() {
		if (!editing) return;
		if (await deleteList(editing, t, locale())) ui.closeListDialog();
	}
</script>

<Dialog
	open={dialog.open}
	title={editing ? t('lists.edit') : t(shopping ? 'shopping.new' : 'lists.new')}
	closeLabel={t('common.close')}
	size="sm"
	onclose={() => ui.closeListDialog()}
>
	<form
		id="list-form"
		class="flex flex-col gap-6"
		onsubmit={(event) => {
			event.preventDefault();
			void submit();
		}}
	>
		<Field label={t('lists.name')} for="list-name" {error}>
			<Input
				id="list-name"
				bind:ref={nameInput}
				bind:value={name}
				size="lg"
				placeholder={t(shopping ? 'shopping.namePlaceholder' : 'lists.namePlaceholder')}
				invalid={!!error}
				oninput={() => (error = null)}
			/>
		</Field>

		<Field label={t('lists.color')}>
			<ColorPicker bind:value={color} label={t('lists.color')} />
		</Field>

		<Field label={t('lists.icon')}>
			<div class="flex flex-wrap gap-2" role="radiogroup" aria-label={t('lists.icon')}>
				{#each LIST_ICONS as option (option)}
					<button
						type="button"
						role="radio"
						aria-checked={icon === option}
						aria-label={option}
						onclick={() => (icon = option)}
						class={`flex h-10 w-10 items-center justify-center rounded-[12px] border transition-colors ${
							icon === option
								? 'border-accent-line bg-accent-soft text-fg'
								: 'border-border bg-surface-2 text-muted hover:text-fg'
						}`}
					>
						<Icon name={listIconName(option)} size={17} />
					</button>
				{/each}
			</div>
		</Field>

		{#if groups.items.length > 0}
			<Field
				label={t('groups.shareWith')}
				for="list-group"
				hint={canShare ? undefined : t('groups.onlyCreator')}
			>
				<Select id="list-group" bind:value={groupId} options={shareOptions} disabled={!canShare} />
			</Field>
		{/if}

		<Field label={t('lists.listDescription')} for="list-description">
			<Textarea
				id="list-description"
				bind:value={description}
				placeholder={t('lists.descriptionPlaceholder')}
				rows={2}
			/>
		</Field>
	</form>

	{#snippet footer()}
		<div class="flex items-center gap-2 border-t border-border pt-5">
			{#if editing}
				<Button variant="danger" size="sm" icon="trash" onclick={remove}>
					{t('common.delete')}
				</Button>
			{/if}
			<span class="flex-1"></span>
			<Button variant="ghost" onclick={() => ui.closeListDialog()}>{t('common.cancel')}</Button>
			<Button type="submit" form="list-form" variant="primary" loading={saving}>
				{editing ? t('common.save') : t('common.create')}
			</Button>
		</div>
	{/snippet}
</Dialog>
