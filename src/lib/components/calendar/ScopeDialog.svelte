<script lang="ts">
	import { useTranslations } from '#lib/i18n/index.ts';
	import type { EditScope } from '#lib/types/index.ts';

	import Button from '../ui/Button.svelte';
	import Dialog from '../ui/Dialog.svelte';

	interface Props {
		open: boolean;
		action: 'save' | 'delete';
		onchoose: (scope: EditScope) => void;
		onclose: () => void;
	}

	let { open, action, onchoose, onclose }: Props = $props();

	const t = useTranslations();
	const scopes: EditScope[] = ['this', 'following', 'all'];
</script>

<Dialog
	{open}
	size="sm"
	title={t(`calendar.scope.${action}Title`)}
	closeLabel={t('common.close')}
	{onclose}
>
	<div class="flex flex-col gap-2 pb-2">
		{#each scopes as scope (scope)}
			<Button
				variant={scope === 'this' ? 'primary' : 'outline'}
				block
				onclick={() => onchoose(scope)}
			>
				{t(`calendar.scope.${scope}`)}
			</Button>
		{/each}
	</div>
</Dialog>
