# Klar – Backend-Integration

Dieses Dokument beschreibt, wie das Frontend mit dem Spring-Boot-Backend verbunden wird und
welche REST-Endpunkte das Frontend erwartet. Die Endpunkte sind ein **Vorschlag aus Frontend-Sicht**;
Pfade lassen sich zentral in `src/lib/api/config.ts` anpassen.

## 1. Architektur im Frontend

```
src/lib/api/
├── config.ts          # Basis-URL, Mock-Schalter, Endpunkt-Pfade (zentral)
├── http.ts            # fetch-Wrapper: JSON, Bearer-Token, Fehler → ApiError
├── errors.ts          # ApiError (code: network | unauthorized | not_found | validation | server | …)
├── index.ts           # exportiert `api` – wählt Mock oder REST anhand PUBLIC_USE_MOCK_API
├── services/          # REST-Implementierung (spricht mit Spring Boot)
│   ├── types.ts       # Interfaces TasksApi, ListsApi, AuthApi
│   ├── tasks.ts
│   ├── lists.ts
│   └── auth.ts
└── mock/              # Mock-Implementierung (localStorage + simulierte Latenz)
    ├── seed.ts        # Demo-Daten
    ├── storage.ts
    ├── tasks.ts / lists.ts / auth.ts
    └── index.ts
```

Die Stores in `src/lib/stores/*.svelte.ts` kennen nur das `api`-Objekt und die Interfaces aus
`services/types.ts`. UI-Komponenten greifen ausschließlich auf die Stores zu.

### Umschalten auf das echte Backend

1. `.env` anlegen (siehe `.env.example`):
   ```
   PUBLIC_USE_MOCK_API=false
   PUBLIC_API_BASE_URL=http://localhost:8080/api
   ```
2. Dev-Server neu starten. Ab jetzt werden `services/*.ts` verwendet.
3. Die Mock-Dateien unter `src/lib/api/mock/` können später gelöscht werden; dann auch
   `resetMockData` aus `services/types.ts` und die Demo-Hinweise in Login/Einstellungen entfernen.

### CORS

Der Dev-Server läuft auf `http://localhost:5173`. Das Backend muss diesen Origin erlauben
(inkl. `Authorization`-Header und `credentials`).

## 2. Datenmodelle (JSON)

Alle Zeitstempel sind ISO-8601 (`2026-11-12T09:00:00Z`). `dueDate` ist ein reines Kalenderdatum
(`YYYY-MM-DD`), `dueTime` ein optionaler Zeitstring (`HH:mm`). Typen: `src/lib/types/`.

### Task

| Feld          | Typ                               | Hinweis                    |
| ------------- | --------------------------------- | -------------------------- |
| `id`          | string                            |                            |
| `title`       | string                            | Pflicht, nicht leer        |
| `description` | string \| null                    |                            |
| `dueDate`     | string (YYYY-MM-DD) \| null       |                            |
| `dueTime`     | string (HH:mm) \| null            | nur sinnvoll mit `dueDate` |
| `priority`    | `"low"` \| `"normal"` \| `"high"` |                            |
| `listId`      | string \| null                    | `null` = Posteingang       |
| `completed`   | boolean                           |                            |
| `completedAt` | string \| null                    | vom Backend gesetzt        |
| `createdAt`   | string                            | vom Backend gesetzt        |
| `updatedAt`   | string                            | vom Backend gesetzt        |

### TaskList

| Feld          | Typ            | Hinweis                                                                   |
| ------------- | -------------- | ------------------------------------------------------------------------- |
| `id`          | string         |                                                                           |
| `name`        | string         | Pflicht                                                                   |
| `description` | string \| null |                                                                           |
| `color`       | string         | `orange, blue, purple, lime, pink, teal, yellow, gray`                    |
| `icon`        | string         | `list, home, cart, book, heart, star, target, sparkles, briefcase, music` |
| `createdAt`   | string         |                                                                           |
| `updatedAt`   | string         |                                                                           |

### User / AuthSession

```json
{ "user": { "id": "…", "name": "Marvin", "email": "…", "createdAt": "…" }, "accessToken": "…" }
```

## 3. Benötigte Endpunkte

Basis: `PUBLIC_API_BASE_URL` (Standard `http://localhost:8080/api`). Alle Antworten als JSON,
alle Endpunkte außer Login/Registrierung/Passwort-vergessen sind authentifiziert.

### Auth

| Methode | Pfad                    | Body                        | Antwort                          |
| ------- | ----------------------- | --------------------------- | -------------------------------- |
| POST    | `/auth/login`           | `{ email, password }`       | `AuthSession`                    |
| POST    | `/auth/register`        | `{ name, email, password }` | `AuthSession`                    |
| POST    | `/auth/logout`          | –                           | 204                              |
| POST    | `/auth/forgot-password` | `{ email }`                 | 204 (immer, auch wenn unbekannt) |
| GET     | `/auth/me`              | –                           | `User` oder 401                  |
| PATCH   | `/users/me`             | `{ name?, email? }`         | `User`                           |

Das Frontend sendet `Authorization: Bearer <accessToken>` (gespeichert in `localStorage`, Schlüssel
`klar.accessToken`, siehe `http.ts`). Soll stattdessen ein httpOnly-Cookie verwendet werden, muss nur
`tokenStorage` in `http.ts` angepasst werden – `credentials: 'include'` ist bereits gesetzt.

### Tasks

| Methode | Pfad          | Body                           | Antwort                                                |
| ------- | ------------- | ------------------------------ | ------------------------------------------------------ |
| GET     | `/tasks`      | –                              | `Task[]` (alle Aufgaben des Nutzers, offen + erledigt) |
| GET     | `/tasks/{id}` | –                              | `Task`                                                 |
| POST    | `/tasks`      | `CreateTaskInput`              | `Task` (201)                                           |
| PATCH   | `/tasks/{id}` | `UpdateTaskInput` (Teilobjekt) | `Task`                                                 |
| DELETE  | `/tasks/{id}` | –                              | 204                                                    |

`UpdateTaskInput` enthält auch `completed: boolean`. Beim Setzen auf `true` soll das Backend
`completedAt` setzen, bei `false` auf `null` zurücksetzen. Ein eigener `/complete`-Endpunkt ist nicht
nötig.

Das Frontend filtert Heute/Überfällig/Demnächst/Posteingang clientseitig. Für sehr viele Aufgaben kann
später eine Filterung per Query-Parameter ergänzt werden (`?completed=false&listId=…`).

### Listen

| Methode | Pfad          | Body              | Antwort          |
| ------- | ------------- | ----------------- | ---------------- |
| GET     | `/lists`      | –                 | `TaskList[]`     |
| GET     | `/lists/{id}` | –                 | `TaskList`       |
| POST    | `/lists`      | `CreateListInput` | `TaskList` (201) |
| PATCH   | `/lists/{id}` | `UpdateListInput` | `TaskList`       |
| DELETE  | `/lists/{id}` | –                 | 204              |

Beim Löschen einer Liste erwartet das Frontend, dass die zugehörigen Aufgaben **in den Posteingang
verschoben** werden (`listId = null`) und nicht gelöscht werden.

## 4. Fehlerformat

Bei Fehlern erwartet der HTTP-Client einen passenden Statuscode und optional einen JSON-Body mit
`message`:

```json
{ "message": "Title must not be blank", "errors": { "title": "must not be blank" } }
```

Mapping im Frontend (`errors.ts`): 400/422 → `validation`, 401 → `unauthorized` (Session wird
verworfen, Redirect zum Login), 403 → `forbidden`, 404 → `not_found`, 5xx → `server`.

## 5. Checkliste für die Anbindung

- [ ] Endpunkte wie oben bereitstellen (oder Pfade in `config.ts` anpassen)
- [ ] CORS für `http://localhost:5173` erlauben
- [ ] `.env` mit `PUBLIC_USE_MOCK_API=false` anlegen
- [ ] Login-Flow testen (`/auth/login` → `/auth/me` beim Reload)
- [ ] Demo-Hinweise entfernen (`apiConfig.useMock` wird dafür bereits abgefragt)
