<script lang="ts">
	import { useLocale, useTranslations } from '#lib/i18n/index.ts';
	import { lists } from '#lib/stores/lists.svelte.ts';
	import { settings } from '#lib/stores/settings.svelte.ts';
	import { tasks } from '#lib/stores/tasks.svelte.ts';
	import { toasts } from '#lib/stores/toasts.svelte.ts';
	import { ui } from '#lib/stores/ui.svelte.ts';
	import { TASK_PRIORITIES, type TaskPriority } from '#lib/types/index.ts';
	import { formatDateTime } from '#lib/utils/date.ts';

	import Button from '../ui/Button.svelte';
	import Dialog from '../ui/Dialog.svelte';
	import Field from '../ui/Field.svelte';
	import Input from '../ui/Input.svelte';
	import Select from '../ui/Select.svelte';
	import Textarea from '../ui/Textarea.svelte';

	const t = useTranslations();
	const locale = useLocale();

	const dialog = $derived(ui.taskDialog);
	const editing = $derived(dialog.task);

	let title = $state('');
	let description = $state('');
	let listId = $state('');
	let priority = $state<TaskPriority>('normal');
	let dueDate = $state('');
	let dueTime = $state('');
	let error = $state<string | null>(null);
	let saving = $state(false);
	let titleInput = $state<HTMLInputElement | null>(null);

	// Populate the form whenever the dialog opens
	$effect(() => {
		if (!dialog.open) return;
		const task = dialog.task;
		const defaults = dialog.defaults;
		title = task?.title ?? defaults.title ?? '';
		description = task?.description ?? defaults.description ?? '';
		listId = task?.listId ?? defaults.listId ?? settings.value.defaultListId ?? '';
		priority = task?.priority ?? defaults.priority ?? settings.value.defaultPriority;
		dueDate = task?.dueDate ?? defaults.dueDate ?? '';
		dueTime = task?.dueTime ?? defaults.dueTime ?? '';
		error = null;
		setTimeout(() => titleInput?.focus(), 30);
	});

	const listOptions = $derived([
		{ value: '', label: t('tasks.noList') },
		...lists.items.map((l) => ({ value: l.id, label: l.name }))
	]);

	const priorityOptions = $derived(
		TASK_PRIORITIES.map((p) => ({ value: p, label: t(`tasks.priorities.${p}`) }))
	);

	async function submit() {
		if (!title.trim()) {
			error = t('tasks.titleRequired');
			titleInput?.focus();
			return;
		}
		saving = true;
		const input = {
			title: title.trim(),
			description: description.trim() || null,
			listId: listId || null,
			priority,
			dueDate: dueDate || null,
			dueTime: dueDate && dueTime ? dueTime : null
		};
		try {
			if (editing) {
				await tasks.update(editing.id, input);
				toasts.success(t('tasks.updated'));
			} else {
				await tasks.create(input);
				toasts.success(t('tasks.created'));
			}
			ui.closeTaskDialog();
		} catch {
			toasts.error(t('common.errorGeneric'));
		} finally {
			saving = false;
		}
	}

	async function remove() {
		if (!editing) return;
		if (
			settings.value.confirmDelete &&
			!confirm(t('tasks.deleteConfirm', { title: editing.title }))
		)
			return;
		try {
			await tasks.remove(editing.id);
			toasts.success(t('tasks.deleted'));
			ui.closeTaskDialog();
		} catch {
			toasts.error(t('common.errorGeneric'));
		}
	}
</script>

<Dialog
	open={dialog.open}
	title={editing ? t('tasks.edit') : t('tasks.new')}
	closeLabel={t('common.close')}
	onclose={() => ui.closeTaskDialog()}
>
	<form
		id="task-form"
		class="flex flex-col gap-6"
		onsubmit={(event) => {
			event.preventDefault();
			void submit();
		}}
	>
		<div class="flex flex-col gap-2">
			<Input
				bind:ref={titleInput}
				bind:value={title}
				size="lg"
				placeholder={t('tasks.titleLabel')}
				aria-label={t('tasks.titleLabel')}
				invalid={!!error}
				oninput={() => (error = null)}
			/>
			{#if error}<p class="text-[12px] text-danger-text" role="alert">{error}</p>{/if}
		</div>

		<div class="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-x-8">
			<Field label={t('tasks.list')} for="task-list">
				<Select id="task-list" bind:value={listId} options={listOptions} />
			</Field>
			<Field label={t('tasks.priority')} for="task-priority">
				<Select id="task-priority" bind:value={priority} options={priorityOptions} />
			</Field>
			<Field label={t('tasks.dueDate')} for="task-date">
				<Input id="task-date" type="date" bind:value={dueDate} placeholder={t('tasks.pickDate')} />
			</Field>
			<Field label={t('tasks.dueTime')} for="task-time">
				<Input
					id="task-time"
					type="time"
					bind:value={dueTime}
					placeholder={t('common.optional')}
					disabled={!dueDate}
				/>
			</Field>
		</div>

		<Field label={t('tasks.description')} for="task-description">
			<Textarea
				id="task-description"
				bind:value={description}
				placeholder={t('tasks.descriptionPlaceholder')}
				rows={3}
			/>
		</Field>
	</form>

	{#snippet footer()}
		<div
			class="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between"
		>
			<div class="flex items-center gap-2 text-[12px] text-muted">
				{#if editing}
					<span>{t('tasks.createdAt', { date: formatDateTime(editing.createdAt, locale()) })}</span>
					<Button variant="danger" size="sm" icon="trash" onclick={remove}
						>{t('common.delete')}</Button
					>
				{/if}
			</div>
			<div class="flex items-center justify-end gap-2">
				<Button variant="ghost" onclick={() => ui.closeTaskDialog()}>{t('common.cancel')}</Button>
				<Button type="submit" form="task-form" variant="primary" loading={saving}>
					{editing ? t('tasks.saveAction') : t('tasks.createAction')}
				</Button>
			</div>
		</div>
	{/snippet}
</Dialog>
