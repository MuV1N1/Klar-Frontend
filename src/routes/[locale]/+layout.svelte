
	<script lang="ts">
    import { setContext } from 'svelte';

    import './layout.css';

    import {
        I18N_CONTEXT,
        translate,
        type Translator
    } from '#lib/i18n/index.ts';

    let { data, children } = $props();

    const translator: Translator = (key, variables) => {
        return translate(
            data.translations,
            data.locale,
            key,
            variables
        );
    };

    setContext(I18N_CONTEXT, translator);
</script>

<svelte:head>
    <title>Klar</title>
</svelte:head>

<header>
    <!-- Dein eigener Header -->
</header>

<main>
	{@render children()}
</main>
