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

## Handy-App (Android, iOS)

Die App ist dieses Frontend als statische SPA in einer [Capacitor](https://capacitorjs.com)-Hülle
(`capacitor.config.ts`, native Projekte in `android/` und `ios/`).

```bash
cp .env.app.example .env.app   # absolute API-URL, die App hat keinen eigenen Server
npm run build:app              # SPA bauen und in android/ und ios/ kopieren
npx cap open android           # Android Studio; oder: cd android && ./gradlew assembleDebug
npx cap open ios               # nur auf dem Mac, Xcode
```

Android braucht JDK 21 (neuere JDKs versteht das Gradle der Vorlage nicht) und das Android SDK
(`ANDROID_HOME`). Icons und Splash entstehen aus `assets/` mit `npx @capacitor/assets generate`.

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
