<script lang="ts">
	import { setContext } from 'svelte';

	import { I18N_CONTEXT, LOCALE_CONTEXT, translate, type Translator } from '#lib/i18n/index.ts';

	let { data, children } = $props();

	const translator: Translator = (key, variables) =>
		translate(data.translations, data.locale, key, variables);

	setContext(I18N_CONTEXT, translator);
	setContext(LOCALE_CONTEXT, () => data.locale);
</script>

<svelte:head>
	<title>{translator('app.name')}</title>
	<meta name="description" content={translator('app.description')} />
</svelte:head>

{@render children()}
