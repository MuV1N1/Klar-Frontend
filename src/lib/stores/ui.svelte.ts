import type {
	CalendarEvent,
	CreateTaskInput,
	EditScope,
	ListKind,
	Task,
	TaskList
} from '#lib/types/index.ts';

/** Prefill for a new event, e.g. from clicking a day or a time slot. */
export interface EventDefaults {
	date?: string;
	time?: string;
	allDay?: boolean;
}

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

	listDialog = $state<{ open: boolean; list: TaskList | null; kind: ListKind }>({
		open: false,
		list: null,
		kind: 'todo'
	});

	eventDialog = $state<{ open: boolean; event: CalendarEvent | null; defaults: EventDefaults }>({
		open: false,
		event: null,
		defaults: {}
	});

	searchOpen = $state(false);

	/** "Only this / following / all" question for recurring events (used by drag & drop). */
	scopePrompt = $state<{
		action: 'save' | 'delete';
		resolve: (scope: EditScope | null) => void;
	} | null>(null);

	askScope(action: 'save' | 'delete'): Promise<EditScope | null> {
		this.scopePrompt?.resolve(null);
		return new Promise((resolve) => (this.scopePrompt = { action, resolve }));
	}

	answerScope(scope: EditScope | null) {
		this.scopePrompt?.resolve(scope);
		this.scopePrompt = null;
	}

	openNewEvent(defaults: EventDefaults = {}) {
		this.eventDialog = { open: true, event: null, defaults };
	}

	openEditEvent(event: CalendarEvent) {
		this.eventDialog = { open: true, event, defaults: {} };
	}

	closeEventDialog() {
		this.eventDialog = { ...this.eventDialog, open: false };
	}

	openNewTask(defaults: Partial<CreateTaskInput> = {}) {
		this.taskDialog = { open: true, task: null, defaults };
	}

	openEditTask(task: Task) {
		this.taskDialog = { open: true, task, defaults: {} };
	}

	closeTaskDialog() {
		this.taskDialog = { ...this.taskDialog, open: false };
	}

	openNewList(kind: ListKind = 'todo') {
		this.listDialog = { open: true, list: null, kind };
	}

	openEditList(list: TaskList) {
		this.listDialog = { open: true, list, kind: list.kind };
	}

	closeListDialog() {
		this.listDialog = { ...this.listDialog, open: false };
	}

	toggleSidebar(open?: boolean) {
		this.sidebarOpen = open ?? !this.sidebarOpen;
	}
}

export const ui = new UiStore();
