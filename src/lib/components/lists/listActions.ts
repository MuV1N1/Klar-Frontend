import { goto } from '$app/navigation';
import { page } from '$app/state';

import { localizedHref, type Locale, type Translator } from '#lib/i18n/index.ts';
import { lists } from '#lib/stores/lists.svelte.ts';
import { settings } from '#lib/stores/settings.svelte.ts';
import { tasks } from '#lib/stores/tasks.svelte.ts';
import { toasts } from '#lib/stores/toasts.svelte.ts';
import type { TaskList } from '#lib/types/index.ts';

import { listPath } from './listHelpers.ts';

/**
 * Deletes a list after confirmation. Its tasks are kept and moved to the inbox; the items of a
 * shopping list are deleted with it.
 * Used by the list card menu, the list page and the edit dialog.
 * Returns true when the list was deleted.
 */
export async function deleteList(list: TaskList, t: Translator, locale: Locale): Promise<boolean> {
	const shopping = list.kind === 'shopping';
	const confirmKey = shopping ? 'shopping.deleteConfirm' : 'lists.deleteConfirm';
	if (!confirm(t(confirmKey, { name: list.name }))) return false;

	const onListPage = page.url.pathname === localizedHref(locale, listPath(list));

	try {
		await lists.remove(list.id);
		if (shopping) {
			tasks.dropList(list.id);
		} else {
			tasks.detachFromList(list.id);
			// Tasks of other members move to their inbox, out of sight.
			if (list.groupId) void tasks.load(true);
		}
		if (settings.value.defaultListId === list.id) settings.update({ defaultListId: null });
		toasts.success(t('lists.deleted'));
		// The page of a deleted list no longer exists.
		if (onListPage) {
			await goto(localizedHref(locale, shopping ? '/app/shopping' : '/app/todos'), {
				replace: true
			});
		}
		return true;
	} catch {
		toasts.error(t('common.errorGeneric'));
		return false;
	}
}
