<script lang="ts">
	import { untrack } from 'svelte';

	import type { OccurrenceRef } from '#lib/api/index.ts';
	import { useTranslations } from '#lib/i18n/index.ts';
	import { calendar } from '#lib/stores/calendar.svelte.ts';
	import { notifications } from '#lib/stores/notifications.svelte.ts';
	import { settings } from '#lib/stores/settings.svelte.ts';
	import { toasts } from '#lib/stores/toasts.svelte.ts';
	import { ui } from '#lib/stores/ui.svelte.ts';
	import {
		LIST_COLORS,
		LIST_COLOR_VALUES,
		type EditScope,
		type ListColor,
		type Reminder,
		type UpdateEventInput
	} from '#lib/types/index.ts';
	import { addDaysISO, parseISODate, todayISO } from '#lib/utils/date.ts';

	import Button from '../ui/Button.svelte';
	import Dialog from '../ui/Dialog.svelte';
	import Field from '../ui/Field.svelte';
	import Icon from '../ui/Icon.svelte';
	import Input from '../ui/Input.svelte';
	import Textarea from '../ui/Textarea.svelte';
	import Toggle from '../ui/Toggle.svelte';
	import RecurrenceEditor from './RecurrenceEditor.svelte';
	import ReminderEditor from './ReminderEditor.svelte';
	import ScopeDialog from './ScopeDialog.svelte';

	const t = useTranslations();

	const dialog = $derived(ui.eventDialog);
	const editing = $derived(dialog.event);
	const browserZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

	let title = $state('');
	let allDay = $state(false);
	let startDate = $state('');
	let startTime = $state('');
	let endDate = $state('');
	let endTime = $state('');
	let location = $state('');
	let description = $state('');
	let color = $state<ListColor>('blue');
	let recurrence = $state<string | null>(null);
	let reminders = $state<Reminder[]>([]);
	let recurrenceTouched = $state(false);
	let remindersTouched = $state(false);
	let error = $state<string | null>(null);
	let saving = $state(false);
	let scopeAction = $state<'save' | 'delete' | null>(null);
	let titleInput = $state<HTMLInputElement | null>(null);
	/** Start before the last change, to keep the duration when the start moves. */
	let previousStart = { date: '', time: '' };

	/** "HH:mm" plus minutes, capped at 23:59 (the end then moves to the next day). */
	function addMinutes(date: string, time: string, minutes: number): { date: string; time: string } {
		const [h, m] = time.split(':').map(Number);
		const total = (h ?? 0) * 60 + (m ?? 0) + minutes;
		const days = Math.floor(total / 1440);
		const rest = ((total % 1440) + 1440) % 1440;
		return {
			date: addDaysISO(days, parseISODate(date)),
			time: `${String(Math.floor(rest / 60)).padStart(2, '0')}:${String(rest % 60).padStart(2, '0')}`
		};
	}

	function minutesBetween(fromDate: string, fromTime: string, toDate: string, toTime: string) {
		const from = new Date(`${fromDate}T${fromTime || '00:00'}:00`).getTime();
		const to = new Date(`${toDate}T${toTime || '00:00'}:00`).getTime();
		return Math.round((to - from) / 60_000);
	}

	/** Next full hour from now. */
	function nextHour(): string {
		const hour = Math.min(new Date().getHours() + 1, 23);
		return `${String(hour).padStart(2, '0')}:00`;
	}

	// Populate the form whenever the dialog opens
	$effect(() => {
		if (!dialog.open) return;
		const event = dialog.event;
		const defaults = dialog.defaults;
		untrack(() => {
			if (event) {
				title = event.title;
				allDay = event.allDay;
				startDate = event.startDate;
				startTime = event.startTime ?? '09:00';
				endDate = event.endDate;
				endTime = event.endTime ?? '10:00';
				location = event.location ?? '';
				description = event.description ?? '';
				color = event.color;
				recurrence = event.recurrence;
				reminders = event.reminders;
			} else {
				title = '';
				allDay = defaults.allDay ?? false;
				startDate = defaults.date ?? todayISO();
				startTime = defaults.time ?? nextHour();
				const end = addMinutes(startDate, startTime, 60);
				endDate = allDay ? startDate : end.date;
				endTime = end.time;
				location = '';
				description = '';
				color = 'blue';
				recurrence = null;
				reminders = notifications.defaultsFor(allDay);
			}
			recurrenceTouched = false;
			remindersTouched = false;
			error = null;
			scopeAction = null;
			previousStart = { date: startDate, time: startTime };
		});
		setTimeout(() => titleInput?.focus(), 30);
	});

	const isSeries = $derived(
		!!editing && (editing.recurrence !== null || editing.seriesId !== null)
	);
	const otherZone = $derived(!!editing && !editing.allDay && editing.timeZone !== browserZone);

	// Moving the start keeps the duration.
	function onStartChange() {
		if (previousStart.date && startDate) {
			const duration = minutesBetween(previousStart.date, previousStart.time, endDate, endTime);
			if (allDay) {
				endDate = addDaysISO(
					Math.round(
						(parseISODate(endDate).getTime() - parseISODate(previousStart.date).getTime()) /
							86_400_000
					),
					parseISODate(startDate)
				);
			} else if (duration >= 0) {
				const end = addMinutes(startDate, startTime, duration);
				endDate = end.date;
				endTime = end.time;
			}
		}
		previousStart = { date: startDate, time: startTime };
	}

	function onAllDayChange(checked: boolean) {
		allDay = checked;
		if (checked && endDate < startDate) endDate = startDate;
		// Untouched reminders follow the defaults of the new kind.
		if (!remindersTouched && !editing) reminders = notifications.defaultsFor(checked);
	}

	function validate(): boolean {
		if (!title.trim()) {
			error = t('calendar.event.titleRequired');
			titleInput?.focus();
			return false;
		}
		if (!startDate || !endDate || (!allDay && (!startTime || !endTime))) {
			error = t('calendar.event.timeRequired');
			return false;
		}
		const ok = allDay
			? endDate >= startDate
			: minutesBetween(startDate, startTime, endDate, endTime) >= 0;
		if (!ok) {
			error = t('calendar.event.endBeforeStart');
			return false;
		}
		return true;
	}

	function payload(): UpdateEventInput {
		return {
			title: title.trim(),
			description: description.trim() || null,
			location: location.trim() || null,
			color,
			allDay,
			startDate,
			startTime: allDay ? null : startTime,
			endDate,
			endTime: allDay ? null : endTime
		};
	}

	async function submit() {
		if (!validate()) return;
		if (editing && isSeries) {
			scopeAction = 'save';
			return;
		}
		await save();
	}

	function refFor(scope: EditScope): OccurrenceRef | undefined {
		if (!editing || !isSeries) return undefined;
		return { scope, occurrence: editing.occurrenceStart };
	}

	async function save(scope?: EditScope) {
		saving = true;
		try {
			if (editing) {
				const input = payload();
				// Only send what changed: an unchanged rule must not reset the series' exceptions.
				if (recurrenceTouched && scope !== 'this') input.recurrence = recurrence;
				if (remindersTouched) input.reminders = reminders;
				await calendar.update(editing.id, input, scope ? refFor(scope) : undefined);
				toasts.success(t('calendar.event.updated'));
			} else {
				await calendar.create({
					...payload(),
					title: title.trim(),
					allDay,
					startDate,
					endDate,
					timeZone: browserZone,
					recurrence,
					reminders
				});
				toasts.success(t('calendar.event.created'));
			}
			ui.closeEventDialog();
		} catch {
			toasts.error(t('common.errorGeneric'));
		} finally {
			saving = false;
		}
	}

	async function remove(scope?: EditScope) {
		if (!editing) return;
		if (isSeries && !scope) {
			scopeAction = 'delete';
			return;
		}
		if (
			!isSeries &&
			settings.value.confirmDelete &&
			!confirm(t('calendar.event.deleteConfirm', { title: editing.title }))
		)
			return;
		try {
			await calendar.remove(editing.id, scope ? refFor(scope) : undefined);
			toasts.success(t('calendar.event.deleted'));
			ui.closeEventDialog();
		} catch {
			toasts.error(t('common.errorGeneric'));
		}
	}

	function chooseScope(scope: EditScope) {
		const action = scopeAction;
		scopeAction = null;
		if (action === 'save') void save(scope);
		else if (action === 'delete') void remove(scope);
	}
</script>

<Dialog
	open={dialog.open}
	title={editing ? t('calendar.event.edit') : t('calendar.event.new')}
	closeLabel={t('common.close')}
	onclose={() => ui.closeEventDialog()}
>
	<form
		id="event-form"
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
				placeholder={t('calendar.event.titleLabel')}
				aria-label={t('calendar.event.titleLabel')}
				invalid={!!error && !title.trim()}
				oninput={() => (error = null)}
			/>
			{#if error}<p class="text-[12px] text-danger-text" role="alert">{error}</p>{/if}
		</div>

		<div class="flex flex-col gap-4">
			<Toggle checked={allDay} label={t('calendar.event.allDay')} onchange={onAllDayChange} />
			<div class="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-x-6">
				<Field label={t('calendar.event.start')} for="event-start-date">
					<div class="flex gap-2">
						<div class="min-w-0 flex-1">
							<Input
								id="event-start-date"
								type="date"
								bind:value={startDate}
								onchange={onStartChange}
							/>
						</div>
						{#if !allDay}
							<div class="w-36 shrink-0">
								<Input
									type="time"
									aria-label={t('calendar.event.startTime')}
									bind:value={startTime}
									onchange={onStartChange}
								/>
							</div>
						{/if}
					</div>
				</Field>
				<Field label={t('calendar.event.end')} for="event-end-date">
					<div class="flex gap-2">
						<div class="min-w-0 flex-1">
							<Input id="event-end-date" type="date" bind:value={endDate} min={startDate} />
						</div>
						{#if !allDay}
							<div class="w-36 shrink-0">
								<Input type="time" aria-label={t('calendar.event.endTime')} bind:value={endTime} />
							</div>
						{/if}
					</div>
				</Field>
			</div>
			{#if otherZone && editing}
				<p class="flex items-center gap-1.5 text-[12px] text-muted">
					<Icon name="globe" size={13} />
					{t('calendar.event.otherZone', { zone: editing.timeZone })}
				</p>
			{/if}
		</div>

		<Field label={t('calendar.event.recurrence')} for="event-recurrence">
			<RecurrenceEditor
				bind:value={recurrence}
				{startDate}
				onchange={() => (recurrenceTouched = true)}
			/>
		</Field>

		<Field label={t('calendar.event.reminders')}>
			<ReminderEditor
				bind:reminders
				{allDay}
				id="event-reminders"
				onchange={() => (remindersTouched = true)}
			/>
			{#if isSeries}<p class="text-[12px] text-muted">{t('calendar.event.remindersSeries')}</p>{/if}
		</Field>

		<Field label={t('calendar.event.location')} for="event-location">
			<Input
				id="event-location"
				bind:value={location}
				placeholder={t('common.optional')}
				maxlength={300}
			/>
		</Field>

		<Field label={t('calendar.event.color')}>
			<div class="flex flex-wrap gap-2.5" role="radiogroup" aria-label={t('calendar.event.color')}>
				{#each LIST_COLORS as option (option)}
					<button
						type="button"
						role="radio"
						aria-checked={color === option}
						aria-label={t(`lists.colors.${option}`)}
						title={t(`lists.colors.${option}`)}
						onclick={() => (color = option)}
						class={`flex h-8 w-8 items-center justify-center rounded-full transition-transform hover:scale-110 ${color === option ? 'ring-2 ring-fg ring-offset-2 ring-offset-surface' : ''}`}
						style={`background:${LIST_COLOR_VALUES[option]}`}
					>
						{#if color === option}<Icon
								name="check"
								size={13}
								strokeWidth={3}
								class="text-white dark:text-[#101114]"
							/>{/if}
					</button>
				{/each}
			</div>
		</Field>

		<Field label={t('calendar.event.description')} for="event-description">
			<Textarea
				id="event-description"
				bind:value={description}
				placeholder={t('common.optional')}
				rows={3}
			/>
		</Field>
	</form>

	{#snippet footer()}
		<div
			class="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between"
		>
			<div class="flex items-center gap-2">
				{#if editing}
					<Button variant="danger" size="sm" icon="trash" onclick={() => remove()}
						>{t('common.delete')}</Button
					>
				{/if}
			</div>
			<div class="flex items-center justify-end gap-2">
				<Button variant="ghost" onclick={() => ui.closeEventDialog()}>{t('common.cancel')}</Button>
				<Button type="submit" form="event-form" variant="primary" loading={saving}>
					{editing ? t('calendar.event.saveAction') : t('calendar.event.createAction')}
				</Button>
			</div>
		</div>
	{/snippet}
</Dialog>

<ScopeDialog
	open={scopeAction !== null}
	action={scopeAction ?? 'save'}
	onchoose={chooseScope}
	onclose={() => (scopeAction = null)}
/>
