import type { CreateTaskInput, Task, TaskList } from '#lib/types/index.ts';

/**
 * Global UI state: which dialog is open and with what payload.
 * Keeping it here lets the sidebar, bottom nav and pages open the same dialogs.
 */
class UiStore {
	sidebarOpen = $state(false);

	taskDialog = $state<{ open: boolean; task: Task | null; defaults: Partial<CreateTaskInput> }>({
		open: false,
		task: null,
		defaults: {}
	});

	listDialog = $state<{ open: boolean; list: TaskList | null }>({ open: false, list: null });

	searchOpen = $state(false);

	openNewTask(defaults: Partial<CreateTaskInput> = {}) {
		this.taskDialog = { open: true, task: null, defaults };
	}

	openEditTask(task: Task) {
		this.taskDialog = { open: true, task, defaults: {} };
	}

	closeTaskDialog() {
		this.taskDialog = { ...this.taskDialog, open: false };
	}

	openNewList() {
		this.listDialog = { open: true, list: null };
	}

	openEditList(list: TaskList) {
		this.listDialog = { open: true, list };
	}

	closeListDialog() {
		this.listDialog = { ...this.listDialog, open: false };
	}

	toggleSidebar(open?: boolean) {
		this.sidebarOpen = open ?? !this.sidebarOpen;
	}
}

export const ui = new UiStore();
