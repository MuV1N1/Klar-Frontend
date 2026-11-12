<script lang="ts">
	import { useTranslations } from '#lib/i18n/index.ts';
	import { lists } from '#lib/stores/lists.svelte.ts';
	import { toasts } from '#lib/stores/toasts.svelte.ts';
	import { ui } from '#lib/stores/ui.svelte.ts';
	import {
		LIST_COLORS,
		LIST_COLOR_VALUES,
		LIST_ICONS,
		type ListColor,
		type ListIcon
	} from '#lib/types/index.ts';

	import Button from '../ui/Button.svelte';
	import Dialog from '../ui/Dialog.svelte';
	import Field from '../ui/Field.svelte';
	import Icon from '../ui/Icon.svelte';
	import Input from '../ui/Input.svelte';
	import Textarea from '../ui/Textarea.svelte';
	import { listIconName } from './listHelpers.ts';

	const t = useTranslations();

	const dialog = $derived(ui.listDialog);
	const editing = $derived(dialog.list);

	let name = $state('');
	let description = $state('');
	let color = $state<ListColor>('lime');
	let icon = $state<ListIcon>('list');
	let error = $state<string | null>(null);
	let saving = $state(false);
	let nameInput = $state<HTMLInputElement | null>(null);

	$effect(() => {
		if (!dialog.open) return;
		name = dialog.list?.name ?? '';
		description = dialog.list?.description ?? '';
		color = dialog.list?.color ?? 'lime';
		icon = dialog.list?.icon ?? 'list';
		error = null;
		setTimeout(() => nameInput?.focus(), 30);
	});

	async function submit() {
		if (!name.trim()) {
			error = t('lists.nameRequired');
			nameInput?.focus();
			return;
		}
		saving = true;
		const input = { name: name.trim(), description: description.trim() || null, color, icon };
		try {
			if (editing) {
				await lists.update(editing.id, input);
				toasts.success(t('lists.updated'));
			} else {
				await lists.create(input);
				toasts.success(t('lists.created'));
			}
			ui.closeListDialog();
		} catch {
			toasts.error(t('common.errorGeneric'));
		} finally {
			saving = false;
		}
	}
</script>

<Dialog
	open={dialog.open}
	title={editing ? t('lists.edit') : t('lists.new')}
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
				placeholder={t('lists.namePlaceholder')}
				invalid={!!error}
				oninput={() => (error = null)}
			/>
		</Field>

		<Field label={t('lists.color')}>
			<div class="flex flex-wrap gap-2.5" role="radiogroup" aria-label={t('lists.color')}>
				{#each LIST_COLORS as option (option)}
					<button
						type="button"
						role="radio"
						aria-checked={color === option}
						aria-label={t(`lists.colors.${option}`)}
						title={t(`lists.colors.${option}`)}
						onclick={() => (color = option)}
						class={`flex h-9 w-9 items-center justify-center rounded-full transition-transform hover:scale-110 ${color === option ? 'ring-2 ring-fg ring-offset-2 ring-offset-surface' : ''}`}
						style={`background:${LIST_COLOR_VALUES[option]}`}
					>
						{#if color === option}<Icon
								name="check"
								size={14}
								strokeWidth={3}
								class="text-white dark:text-[#101114]"
							/>{/if}
					</button>
				{/each}
			</div>
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
		<div class="flex items-center justify-end gap-2 border-t border-border pt-5">
			<Button variant="ghost" onclick={() => ui.closeListDialog()}>{t('common.cancel')}</Button>
			<Button type="submit" form="list-form" variant="primary" loading={saving}>
				{editing ? t('common.save') : t('common.create')}
			</Button>
		</div>
	{/snippet}
</Dialog>
