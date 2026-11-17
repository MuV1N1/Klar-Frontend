/** Colours offered as quick picks; they adapt to light and dark mode. */
export type PresetColor =
	'orange' | 'blue' | 'purple' | 'lime' | 'pink' | 'teal' | 'yellow' | 'gray';

/** A preset name or any colour chosen in the picker as `#rrggbb`. */
export type ListColor = PresetColor | `#${string}`;

export const LIST_COLORS: readonly PresetColor[] = [
	'orange',
	'blue',
	'purple',
	'lime',
	'pink',
	'teal',
	'yellow',
	'gray'
];

/**
 * CSS colour for each preset. The values are theme-aware custom properties
 * defined in `src/app.css` (brighter in dark mode, darker in light mode).
 */
export const LIST_COLOR_VALUES: Record<PresetColor, string> = {
	orange: 'var(--list-orange)',
	blue: 'var(--list-blue)',
	purple: 'var(--list-purple)',
	lime: 'var(--list-lime)',
	pink: 'var(--list-pink)',
	teal: 'var(--list-teal)',
	yellow: 'var(--list-yellow)',
	gray: 'var(--list-gray)'
};

export function isPresetColor(color: string): color is PresetColor {
	return (LIST_COLORS as readonly string[]).includes(color);
}

/** CSS value for a preset or a custom `#rrggbb` colour. */
export function colorValue(color: ListColor | null | undefined): string {
	if (!color) return LIST_COLOR_VALUES.gray;
	return isPresetColor(color) ? LIST_COLOR_VALUES[color] : color;
}

export type ListIcon =
	| 'list'
	| 'home'
	| 'cart'
	| 'book'
	| 'heart'
	| 'star'
	| 'target'
	| 'sparkles'
	| 'briefcase'
	| 'music';

export const LIST_ICONS: readonly ListIcon[] = [
	'list',
	'home',
	'cart',
	'book',
	'heart',
	'star',
	'target',
	'sparkles',
	'briefcase',
	'music'
];

/** `shopping`: the tasks are items to buy, "completed" means bought. Fixed once created. */
export type ListKind = 'todo' | 'shopping';

export interface TaskList {
	id: string;
	name: string;
	description: string | null;
	color: ListColor;
	icon: ListIcon;
	kind: ListKind;
	/** null = private; otherwise every member of the group sees and edits the list. */
	groupId: string | null;
	/** User id of the creator; only they can change `groupId`. */
	createdBy: string;
	/** ISO timestamp. */
	createdAt: string;
	/** ISO timestamp. */
	updatedAt: string;
}

export interface CreateListInput {
	name: string;
	description?: string | null;
	color?: ListColor;
	icon?: ListIcon;
	groupId?: string | null;
	kind?: ListKind;
}

export type UpdateListInput = Partial<Omit<CreateListInput, 'kind'>>;
