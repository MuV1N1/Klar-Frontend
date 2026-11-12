import {
	LIST_COLOR_VALUES,
	type ListColor,
	type ListIcon,
	type TaskList
} from '#lib/types/index.ts';

import type { IconName } from '../ui/icons.ts';

export function listColorValue(color: ListColor | undefined): string {
	return LIST_COLOR_VALUES[color ?? 'gray'];
}

export function listIconName(icon: ListIcon | undefined): IconName {
	return (icon ?? 'list') as IconName;
}

export function colorOf(list: TaskList | undefined): string | null {
	return list ? listColorValue(list.color) : null;
}
