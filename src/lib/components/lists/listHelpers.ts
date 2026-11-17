import { colorValue, type ListColor, type ListIcon, type TaskList } from '#lib/types/index.ts';

import type { IconName } from '../ui/icons.ts';

export function listColorValue(color: ListColor | undefined): string {
	return colorValue(color);
}

export function listIconName(icon: ListIcon | undefined): IconName {
	return (icon ?? 'list') as IconName;
}

/** Page of a list: shopping lists live under /app/shopping, the rest under /app/todos. */
export function listPath(list: TaskList): string {
	return `${list.kind === 'shopping' ? '/app/shopping' : '/app/todos'}/${list.id}`;
}

export function colorOf(list: TaskList | undefined): string | null {
	return list ? listColorValue(list.color) : null;
}
