<script lang="ts">
	import { page } from '$app/state';
	import { setContext } from 'svelte';

	import Icon from '#lib/components/ui/Icon.svelte';
	import { I18N_CONTEXT, LOCALE_CONTEXT, translate, type Translator } from '#lib/i18n/index.ts';
	import { useShowKeys, withoutShowKeys } from '#lib/i18n/showKeys.svelte.ts';

	let { data, children } = $props();

	const showKeys = useShowKeys();

	const translator: Translator = (key, variables) =>
		showKeys() ? key : translate(data.messages, data.locale, key, variables);

	setContext(I18N_CONTEXT, translator);
	setContext(LOCALE_CONTEXT, () => data.locale);
</script>

<svelte:head>
	<title>{translator('app.name')}</title>
	<meta name="description" content={translator('app.description')} />
</svelte:head>

{@render children()}

{#if showKeys()}
	<!-- Not translated on purpose: in key mode every text would be a key. Above the bottom nav on phones. -->
	<a
		href={withoutShowKeys(page.url)}
		data-sveltekit-replacestate
		class="fixed bottom-20 left-4 z-50 flex items-center gap-1.5 rounded-full bg-fg px-3 py-1.5 font-mono text-[11px] font-medium text-bg shadow-lg transition-opacity hover:opacity-85 md:bottom-4"
		title="showKeys=0"
	>
		UI keys
		<Icon name="x" size={12} strokeWidth={2.5} />
	</a>
{/if}
