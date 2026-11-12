export type ListColor = 'orange' | 'blue' | 'purple' | 'lime' | 'pink' | 'teal' | 'yellow' | 'gray';

export const LIST_COLORS: readonly ListColor[] = [
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
 * CSS colour for each list colour. The values are theme-aware custom properties
 * defined in `src/app.css` (brighter in dark mode, darker in light mode).
 */
export const LIST_COLOR_VALUES: Record<ListColor, string> = {
	orange: 'var(--list-orange)',
	blue: 'var(--list-blue)',
	purple: 'var(--list-purple)',
	lime: 'var(--list-lime)',
	pink: 'var(--list-pink)',
	teal: 'var(--list-teal)',
	yellow: 'var(--list-yellow)',
	gray: 'var(--list-gray)'
};

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

export interface TaskList {
	id: string;
	name: string;
	description: string | null;
	color: ListColor;
	icon: ListIcon;
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
}

export type UpdateListInput = Partial<CreateListInput>;
