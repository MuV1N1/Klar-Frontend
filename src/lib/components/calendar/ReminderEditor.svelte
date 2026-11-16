<script lang="ts">
	import { useLocale, useTranslations } from '#lib/i18n/index.ts';
	import { REMINDER_CHANNELS, type Reminder, type ReminderChannel } from '#lib/types/index.ts';
	import {
		ALL_DAY_PRESETS,
		MAX_REMINDERS,
		TIMED_PRESETS,
		describeReminder
	} from '#lib/utils/reminders.ts';

	import Icon from '../ui/Icon.svelte';
	import IconButton from '../ui/IconButton.svelte';
	import Select from '../ui/Select.svelte';

	interface Props {
		reminders: Reminder[];
		/** All-day event or task without a time: reminders count from 00:00 of the day. */
		allDay: boolean;
		id?: string;
		onchange?: () => void;
	}

	let { reminders = $bindable([]), allDay, id = 'reminders', onchange }: Props = $props();

	const t = useTranslations();
	const locale = useLocale();

	const presets = $derived(allDay ? ALL_DAY_PRESETS : TIMED_PRESETS);

	/** Presets plus the current value, in case it was set elsewhere (e.g. another device). */
	function timeOptions(current: number) {
		const values = presets.includes(current) ? presets : [current, ...presets];
		return values.map((m) => ({
			value: String(m),
			label: describeReminder(m, allDay, t, locale())
		}));
	}

	const channelOptions = $derived(
		REMINDER_CHANNELS.map((c) => ({ value: c, label: t(`reminders.channels.${c}`) }))
	);

	function set(index: number, patch: Partial<Reminder>) {
		reminders = reminders.map((r, i) => (i === index ? { ...r, ...patch } : r));
		onchange?.();
	}

	function remove(index: number) {
		reminders = reminders.filter((_, i) => i !== index);
		onchange?.();
	}

	function add() {
		const used = new Set(reminders.map((r) => r.minutesBefore));
		const next = presets.find((m) => !used.has(m)) ?? presets[0];
		reminders = [...reminders, { minutesBefore: next, channel: 'push' }];
		onchange?.();
	}
</script>

<div class="flex flex-col gap-2">
	{#each reminders as reminder, index (index)}
		<div class="flex items-center gap-2">
			<Select
				id={`${id}-time-${index}`}
				class="min-w-0 flex-1"
				aria-label={t('reminders.when')}
				value={String(reminder.minutesBefore)}
				options={timeOptions(reminder.minutesBefore)}
				onchange={(e) => set(index, { minutesBefore: Number(e.currentTarget.value) })}
			/>
			<Select
				id={`${id}-channel-${index}`}
				class="w-32 shrink-0"
				aria-label={t('reminders.how')}
				value={reminder.channel}
				options={channelOptions}
				onchange={(e) => set(index, { channel: e.currentTarget.value as ReminderChannel })}
			/>
			<IconButton icon="x" size="sm" label={t('reminders.remove')} onclick={() => remove(index)} />
		</div>
	{/each}
	{#if reminders.length < MAX_REMINDERS}
		<button
			type="button"
			onclick={add}
			class="flex h-10 items-center gap-2 self-start rounded-[12px] px-2 text-[13px] font-medium text-accent-text transition-colors hover:bg-surface-2"
		>
			<Icon name="plus" size={15} strokeWidth={2.5} />
			{t('reminders.add')}
		</button>
	{/if}
</div>
