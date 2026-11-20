<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	import { localizedHref, useLocale } from '#lib/i18n/index.ts';
	import { ui } from '#lib/stores/ui.svelte.ts';

	const locale = useLocale();

	// Focus is a dialog now; old links (bookmarks, notifications) land on the overview with it open.
	$effect(() => {
		ui.openFocus({
			taskId: page.url.searchParams.get('task'),
			listId: page.url.searchParams.get('list')
		});
		void goto(localizedHref(locale(), '/app'), { replaceState: true });
	});
</script>
