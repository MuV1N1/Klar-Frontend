import type { Action } from 'svelte/action';

import type { CalendarEvent, Task } from '#lib/types/index.ts';

/** What is being dragged. Kept here because `dataTransfer` cannot be read during `dragover`. */
export type DragItem = { kind: 'task'; task: Task } | { kind: 'event'; event: CalendarEvent };

class DragStore {
	item = $state<DragItem | null>(null);
}

export const drag = new DragStore();

/**
 * Makes an element draggable (mouse and pen; touch browsers mostly do not start HTML drag & drop).
 * A click without movement still works as before.
 */
export const draggable: Action<HTMLElement, DragItem | null> = (node, initial) => {
	let item = initial;
	const start = (event: DragEvent) => {
		if (!item) return;
		drag.item = item;
		event.stopPropagation();
		if (event.dataTransfer) {
			event.dataTransfer.effectAllowed = 'move';
			event.dataTransfer.setData(
				'text/plain',
				item.kind === 'task' ? item.task.title : item.event.title
			);
		}
	};
	const end = () => (drag.item = null);
	const apply = () => (node.draggable = item !== null);
	apply();
	node.addEventListener('dragstart', start);
	node.addEventListener('dragend', end);
	return {
		update(next) {
			item = next;
			apply();
		},
		destroy() {
			node.removeEventListener('dragstart', start);
			node.removeEventListener('dragend', end);
		}
	};
};

export interface DropTarget {
	/** Whether this target takes the dragged item (e.g. lists only take tasks). */
	accepts: (item: DragItem) => boolean;
	ondrop: (item: DragItem) => void;
}

/**
 * Marks a drop target. While a matching item hovers it, the element gets `data-drop="over"`;
 * while any matching item is dragged, `data-drop="ready"` (for styling via `data-[drop=…]:`).
 */
export const dropTarget: Action<HTMLElement, DropTarget> = (node, initial) => {
	let target = initial;
	let depth = 0;
	const accepted = () => drag.item !== null && target.accepts(drag.item);
	const set = (state: 'over' | 'ready' | null) => {
		if (state) node.dataset.drop = state;
		else delete node.dataset.drop;
	};

	const enter = (event: DragEvent) => {
		if (!accepted()) return;
		event.preventDefault();
		depth++;
		set('over');
	};
	const over = (event: DragEvent) => {
		if (!accepted()) return;
		event.preventDefault();
		if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
	};
	const leave = () => {
		if (!accepted()) return;
		depth = Math.max(0, depth - 1);
		if (depth === 0) set('ready');
	};
	const drop = (event: DragEvent) => {
		const item = drag.item;
		depth = 0;
		if (!item || !target.accepts(item)) return;
		event.preventDefault();
		event.stopPropagation();
		set(null);
		drag.item = null;
		target.ondrop(item);
	};

	node.addEventListener('dragenter', enter);
	node.addEventListener('dragover', over);
	node.addEventListener('dragleave', leave);
	node.addEventListener('drop', drop);

	// Highlight all possible targets while something is dragged.
	const stop = $effect.root(() => {
		$effect(() => {
			const item = drag.item;
			if (!item) {
				depth = 0;
				set(null);
			} else if (target.accepts(item) && node.dataset.drop !== 'over') {
				set('ready');
			}
		});
	});

	return {
		update(next) {
			target = next;
		},
		destroy() {
			stop();
			node.removeEventListener('dragenter', enter);
			node.removeEventListener('dragover', over);
			node.removeEventListener('dragleave', leave);
			node.removeEventListener('drop', drop);
		}
	};
};
