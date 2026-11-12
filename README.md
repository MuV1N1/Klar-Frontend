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

## Demo-Modus

Ohne Backend läuft das Frontend mit einem lokalen Mock-Service (localStorage).
Auf der Login-Seite genügt „Mit Demo-Konto anmelden“ (oder eine beliebige E-Mail + Passwort).
Demo-Daten lassen sich unter **Einstellungen → Daten** zurücksetzen.

Umschalten auf das echte Backend: siehe [docs/BACKEND_INTEGRATION.md](docs/BACKEND_INTEGRATION.md).

## Struktur

```
src/
├── app.css                   # Design-Tokens (hell/dunkel), Tailwind-Theme
├── env.ts                    # Umgebungsvariablen (PUBLIC_USE_MOCK_API, PUBLIC_API_BASE_URL)
├── hooks.server.ts           # setzt <html lang>
├── lib/
│   ├── api/                  # config, http-Client, REST-Services, Mock
│   ├── components/
│   │   ├── ui/               # Button, Input, Select, Dialog, Menu, Checkbox, Chip, …
│   │   ├── layout/           # AppShell, Sidebar, BottomNav, SearchDialog, FocusCard
│   │   ├── tasks/            # TaskItem, TaskSection, QuickAdd, TaskDialog
│   │   ├── lists/            # ListCard, ListDialog
│   │   └── dashboard/        # StatCard, Skeleton
│   ├── i18n/                 # Übersetzungssystem + locales/de.json, en.json
│   ├── stores/               # Svelte-5-Stores: auth, tasks, lists, settings, ui, toasts
│   ├── types/                # Task, TaskList, User
│   └── utils/                # Datum, Sortierung, IDs
└── routes/
    ├── +page.server.ts       # / → /de|/en
    └── [locale]/
        ├── +page.svelte      # Landingpage
        ├── (auth)/           # login, register, forgot-password
        └── app/              # Übersicht, upcoming, inbox, completed, lists, lists/[id], focus, settings
```

## Internationalisierung

Die Sprache steckt in der URL (`/de/...`, `/en/...`). Übersetzungen liegen in
`src/lib/i18n/locales/*.json` und werden mit `t('dashboard.title', { name })` aufgerufen.
Pluralformen: Objekte mit `zero` / `one` / `other`, ausgewählt über die Variable `count`.
Nutzerinhalte (Aufgaben, Listen) werden nie übersetzt.
