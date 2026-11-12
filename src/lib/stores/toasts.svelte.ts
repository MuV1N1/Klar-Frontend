export type ToastKind = 'info' | 'success' | 'error';

export interface Toast {
	id: number;
	kind: ToastKind;
	message: string;
	/** Optional undo-style action. */
	action?: { label: string; onClick: () => void };
}

class ToastStore {
	#toasts = $state<Toast[]>([]);
	#counter = 0;

	get items(): Toast[] {
		return this.#toasts;
	}

	show(message: string, kind: ToastKind = 'info', action?: Toast['action'], duration = 3500) {
		const id = ++this.#counter;
		this.#toasts = [...this.#toasts, { id, kind, message, action }];
		setTimeout(() => this.dismiss(id), duration);
		return id;
	}

	success(message: string, action?: Toast['action']) {
		return this.show(message, 'success', action);
	}

	error(message: string) {
		return this.show(message, 'error', undefined, 5000);
	}

	dismiss(id: number) {
		this.#toasts = this.#toasts.filter((t) => t.id !== id);
	}
}

export const toasts = new ToastStore();
