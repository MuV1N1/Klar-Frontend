<script lang="ts">
	import EmptyState from '#lib/components/ui/EmptyState.svelte';
	import { useTranslations } from '#lib/i18n/index.ts';
	import { auth } from '#lib/stores/auth.svelte.ts';

	let { children } = $props();

	const t = useTranslations();
</script>

<!-- The backend checks the role on every request; this only spares others an empty page. -->
{#if auth.user?.role === 'admin'}
	{@render children()}
{:else}
	<EmptyState icon="shield" title={t('admin.noAccess')} description={t('admin.noAccessHint')} />
{/if}
