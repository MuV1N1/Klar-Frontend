import { goto } from '$app/navigation';
import { page } from '$app/state';

import { localizedHref, type Locale, type Translator } from '#lib/i18n/index.ts';
import { lists } from '#lib/stores/lists.svelte.ts';
import { settings } from '#lib/stores/settings.svelte.ts';
import { tasks } from '#lib/stores/tasks.svelte.ts';
import { toasts } from '#lib/stores/toasts.svelte.ts';
import type { TaskList } from '#lib/types/index.ts';

/**
 * Deletes a list after confirmation. Its tasks are kept and moved to the inbox.
 * Used by the list card menu, the list page and the edit dialog.
 * Returns true when the list was deleted.
 */
export async function deleteList(list: TaskList, t: Translator, locale: Locale): Promise<boolean> {
	if (!confirm(t('lists.deleteConfirm', { name: list.name }))) return false;

	const listPath = localizedHref(locale, `/app/lists/${list.id}`);
	const onListPage = page.url.pathname === listPath;

	try {
		await lists.remove(list.id);
		tasks.detachFromList(list.id);
		// Tasks of other members move to their inbox, out of sight.
		if (list.groupId) void tasks.load(true);
		if (settings.value.defaultListId === list.id) settings.update({ defaultListId: null });
		toasts.success(t('lists.deleted'));
		// The page of a deleted list no longer exists.
		if (onListPage) await goto(localizedHref(locale, '/app/lists'), { replace: true });
		return true;
	} catch {
		toasts.error(t('common.errorGeneric'));
		return false;
	}
}
