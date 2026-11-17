# Klar – Frontend

Klar ist eine private, moderne To-do-App. Dieses Repository enthält das Frontend
(SvelteKit 3, Svelte 5, TypeScript, Tailwind CSS 4). Das Backend entsteht separat mit Spring Boot.

## Starten

```sh
npm install
npm run dev          # http://localhost:5173 → leitet auf /de oder /en
```

Weitere Skripte:

```sh
npm run build        # Produktions-Build
npm run preview      # Build lokal ansehen
npm run check        # svelte-check (TypeScript)
npm run lint         # prettier + eslint
npm run format
```

## Backend

Das Frontend braucht ein laufendes Backend (`PUBLIC_API_BASE_URL`, siehe `.env.example` und
[docs/BACKEND_INTEGRATION.md](docs/BACKEND_INTEGRATION.md)).

## Struktur

```
src/
├── app.css                   # Design-Tokens (hell/dunkel), Tailwind-Theme
├── env.ts                    # Umgebungsvariablen (PUBLIC_API_BASE_URL, API_INTERNAL_URL)
├── hooks.server.ts           # setzt <html lang>
├── lib/
│   ├── api/                  # config, http-Client, REST-Services
│   ├── components/
│   │   ├── ui/               # Button, Input, Select, Dialog, Menu, Checkbox, Chip, …
│   │   ├── layout/           # AppShell, Sidebar, BottomNav, SearchDialog, FocusCard
│   │   ├── tasks/            # TaskItem, TaskSection, QuickAdd, TaskDialog
│   │   ├── lists/            # ListCard, ListDialog
│   │   └── dashboard/        # StatCard, Skeleton
│   ├── i18n/                 # t(), Locale-Helfer (Texte kommen vom Backend)
│   ├── server/i18n.ts        # Lädt die Texte serverseitig vom Backend (ETag-Cache)
│   ├── stores/               # Svelte-5-Stores: auth, tasks, lists, settings, ui, toasts
│   ├── types/                # Task, TaskList, User
│   └── utils/                # Datum, Sortierung, Wiederholungen
└── routes/
    ├── +page.server.ts       # / → /de|/en
    └── [locale]/
        ├── +page.svelte      # Landingpage
        ├── (auth)/           # login, register, forgot-password
        └── app/              # Übersicht, upcoming, inbox, completed, lists, lists/[id], focus, settings
```

## Internationalisierung

Die Sprache steckt in der URL (`/de/...`, `/en/...`). Die Texte liegen **im Backend**
(`Klar-Backend/src/main/resources/i18n/*.json`, Admin-Änderungen in Postgres) und werden beim Rendern über
`GET /api/i18n/<locale>` geladen (`src/routes/+layout.server.ts`). Aufruf mit `t('dashboard.title', { name })`.
Pluralformen: Schlüssel `….zero` / `….one` / `….other`, ausgewählt über die Variable `count`.
Neue Texte also im Backend-Repo eintragen. Admins bearbeiten Texte unter `/<locale>/app/admin/translations`.
Details: `Klar-Backend/docs/I18N.md`.

Nutzerinhalte (Aufgaben, Listen) werden nie übersetzt.
