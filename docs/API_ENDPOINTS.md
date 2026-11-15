# Klar – Benötigte API-Endpunkte

Diese Datei listet alle Endpunkte, die das Frontend tatsächlich aufruft, und wofür sie in der Oberfläche
gebraucht werden. Sie ist aus dem Code abgeleitet (Stores in `src/lib/stores/`, Services in
`src/lib/api/services/`, Pfade in `src/lib/api/config.ts`). Die Datenmodelle und Fehlerformate stehen in
[BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md).

Basis-URL: `PUBLIC_API_BASE_URL` (Standard `http://localhost:8080/api`). Alle Endpunkte außer
Login, Registrierung und Passwort-vergessen erwarten `Authorization: Bearer <accessToken>`.

## Übersicht

| Methode | Pfad                    | Frontend-Aufrufer                                                        | Zweck in der Oberfläche                     |
| ------- | ----------------------- | ------------------------------------------------------------------------ | ------------------------------------------- |
| POST    | `/auth/login`           | Login-Seite → `auth.login`                                               | Anmeldung                                   |
| POST    | `/auth/register`        | Registrierungs-Seite → `auth.register`                                   | Konto anlegen                               |
| POST    | `/auth/logout`          | Einstellungen → `auth.logout`                                            | Abmelden                                    |
| POST    | `/auth/forgot-password` | Passwort-vergessen-Seite → `auth.forgotPassword`                         | E-Mail mit Reset-Link anfordern             |
| GET     | `/auth/me`              | App-Start → `auth.initialise`                                            | Gespeicherte Sitzung wiederherstellen       |
| PATCH   | `/users/me`             | Einstellungen → `auth.updateProfile`                                     | Name und E-Mail ändern                      |
| GET     | `/tasks`                | App-Layout, Retry-Buttons → `tasks.load`                                 | Alle Aufgaben laden (Basis aller Ansichten) |
| POST    | `/tasks`                | Schnellerfassung, Aufgaben-Dialog → `tasks.create`                       | Aufgabe anlegen                             |
| PATCH   | `/tasks/{id}`           | Aufgaben-Dialog, Checkbox, Fokus → `tasks.update` / `tasks.setCompleted` | Bearbeiten, erledigt setzen/zurücksetzen    |
| DELETE  | `/tasks/{id}`           | Aufgaben-Menü, Aufgaben-Dialog, Erledigt-Seite → `tasks.remove`          | Aufgabe löschen                             |
| GET     | `/lists`                | App-Layout, Listen-Seiten → `lists.load`                                 | Alle Listen laden (Sidebar, Listen-Seite)   |
| POST    | `/lists`                | Listen-Dialog → `lists.create`                                           | Liste anlegen                               |
| PATCH   | `/lists/{id}`           | Listen-Dialog → `lists.update`                                           | Liste bearbeiten                            |
| DELETE  | `/lists/{id}`           | Listen-Menü, Listen-Seite, Listen-Dialog → `lists.remove`                | Liste löschen (Aufgaben bleiben erhalten)   |

## Auth

### `POST /auth/login`

- **Wofür:** Anmeldeformular. Bei Erfolg wird `accessToken` im `localStorage` (`klar.accessToken`) gespeichert und `user` in den Auth-Store übernommen.
- **Body:** `{ email, password }`
- **Antwort:** `AuthSession` (`{ user, accessToken }`)
- **Fehler:** 401 bei falschen Daten → Fehlermeldung im Formular.

### `POST /auth/register`

- **Wofür:** Registrierungsformular. Verhält sich wie Login (Token wird gespeichert, Nutzer ist sofort angemeldet).
- **Body:** `{ name, email, password }`
- **Antwort:** `AuthSession`
- **Fehler:** 400/422 bei ungültigen Feldern, 409 wenn die E-Mail bereits existiert (das Frontend zeigt dafür aktuell nur eine generische Meldung – Statuscode 409 wird bisher nicht gesondert behandelt).

### `POST /auth/logout`

- **Wofür:** Button „Abmelden“ in den Einstellungen. Das Frontend löscht den Token auch dann, wenn der Aufruf fehlschlägt.
- **Antwort:** 204

### `POST /auth/forgot-password`

- **Wofür:** Seite „Passwort vergessen“. Zeigt immer dieselbe Bestätigung, damit keine Konten ermittelt werden können.
- **Body:** `{ email }`
- **Antwort:** 204 (auch wenn die E-Mail unbekannt ist)
- **Hinweis:** Es gibt im Frontend **keine** Seite zum Setzen eines neuen Passworts. Dafür fehlt ein Endpunkt (z. B. `POST /auth/reset-password` mit Token und neuem Passwort), sobald der Reset-Link funktionieren soll.

### `GET /auth/me`

- **Wofür:** Wird beim ersten Laden der App aufgerufen (`auth.initialise`). Ohne gespeicherten Token wird er gar nicht erst angefragt. Bei 401 wird der Token verworfen und der Nutzer als abgemeldet behandelt.
- **Antwort:** `User`

### `PATCH /users/me`

- **Wofür:** Profil in den Einstellungen (Name und E-Mail speichern).
- **Body:** `{ name?, email? }` – das Frontend sendet immer beide Felder.
- **Antwort:** `User`

## Aufgaben (Tasks)

### `GET /tasks`

- **Wofür:** Lädt beim Betreten des App-Bereichs alle Aufgaben, offene und erledigte. Alle Ansichten werden daraus **clientseitig** gefiltert: Heute, Überfällig, Demnächst, Posteingang, Erledigt, Listen-Ansicht, Suche und Fortschrittsanzeige im Dashboard. Für die Ansichten gibt es daher keine eigenen Endpunkte.
- **Antwort:** `Task[]`
- **Hinweis:** Bei sehr vielen Aufgaben wären Query-Parameter sinnvoll (z. B. `?completed=false`). Das Frontend nutzt sie noch nicht.

### `POST /tasks`

- **Wofür:** Schnelleingabe (`QuickAdd`) und Aufgaben-Dialog im Modus „Neu“. Die neue Aufgabe wird vorne in die Liste eingefügt.
- **Body:** `CreateTaskInput` – `title` (Pflicht), optional `description`, `dueDate`, `dueTime`, `priority`, `listId`
- **Antwort:** `Task` (201)

### `PATCH /tasks/{id}`

- **Wofür:**
  - Aufgaben-Dialog im Modus „Bearbeiten“ (Teilobjekt mit den geänderten Feldern)
  - Abhaken in der Aufgabenliste, auf der Fokus-Seite und beim Rückgängig-Machen in der Erledigt-Liste (nur `{ completed: true | false }`)
- **Verhalten:** Das Frontend aktualisiert die Oberfläche optimistisch. Bei Fehlschlag wird der alte Stand wiederhergestellt. Beim Setzen auf `completed: true` setzt das Backend `completedAt`, beim Zurücksetzen auf `false` wird es auf `null` gesetzt (siehe `BACKEND_INTEGRATION.md`).
- **Antwort:** `Task`

### `DELETE /tasks/{id}`

- **Wofür:** Aufgabe löschen über das Menü der Aufgabe, im Aufgaben-Dialog und beim Leeren der Erledigt-Liste. Die Oberfläche entfernt die Aufgabe sofort und stellt sie bei Fehlern wieder her.
- **Antwort:** 204
- **Hinweis:** „Alle erledigten löschen“ schickt **einen DELETE pro Aufgabe** parallel (`tasks.removeMany`). Ein Bulk-Endpunkt wie `DELETE /tasks?completed=true` wäre effizienter, ist aber nicht zwingend nötig.

### `GET /tasks/{id}` – derzeit ungenutzt

Der Service-Eintrag `tasks.get` existiert, wird aber von keiner Komponente aufgerufen. Die Oberfläche findet einzelne Aufgaben im bereits geladenen Store (`tasks.byId`). Der Endpunkt kann entfallen oder für später vorgesehen bleiben.

## Listen

### `GET /lists`

- **Wofür:** Lädt beim Betreten des App-Bereichs alle Listen. Sie erscheinen in der Sidebar, auf der Listen-Seite und im Auswahlfeld „Liste“ von Aufgaben.
- **Antwort:** `TaskList[]`

### `POST /lists`

- **Wofür:** Listen-Dialog im Modus „Neu“. Die Liste wird ans Ende angehängt.
- **Body:** `CreateListInput` (`name`, optional `description`, `color`, `icon`)
- **Antwort:** `TaskList` (201)

### `PATCH /lists/{id}`

- **Wofür:** Listen-Dialog im Modus „Bearbeiten“ (Name, Beschreibung, Farbe, Icon).
- **Body:** `UpdateListInput` (Teilobjekt)
- **Antwort:** `TaskList`

### `DELETE /lists/{id}`

- **Wofür:** Liste löschen (aus dem Menü der Listenkarte, der Listen-Seite oder dem Dialog), nach einer Bestätigung.
- **Verhalten:** **Das Backend muss die Aufgaben der Liste in den Posteingang verschieben** (`listId = null`) und darf sie nicht löschen. Das Frontend setzt `listId` lokal ebenfalls auf `null`, verlässt sich aber darauf, dass die Änderung auch serverseitig passiert.
- **Antwort:** 204

### `GET /lists/{id}` – derzeit ungenutzt

Wie bei den Aufgaben ruft das Frontend `lists.get` nicht auf. Die Einzelliste wird aus dem Store gelesen (`lists.byId`).

## Nicht vom Backend abhängig

Diese Funktionen laufen rein im Frontend und brauchen **keinen** Endpunkt:

- **Einstellungen** (Theme, Standardliste, Standardpriorität, Wochenbeginn, Fokus-Dauer, Bestätigungen): gespeichert im `localStorage` (`klar.settings`, `klar.theme`). Sie werden **nicht** zwischen Geräten synchronisiert. Falls das gewünscht ist, bräuchte es z. B. `GET/PATCH /users/me/settings`.
- **Ansichten und Filter** (Heute, Überfällig, Demnächst, Suche, Fortschritt): clientseitig aus `GET /tasks` berechnet.
- **Fokus-Modus**: Timer läuft im Browser; nur das Abhaken nutzt `PATCH /tasks/{id}`.
- **Mock-Daten zurücksetzen** (`resetMockData`): existiert nur im Mock-Modus und hat kein REST-Gegenstück.

## Offene Punkte für das Backend

1. **Passwort zurücksetzen:** Endpunkt zum Setzen des neuen Passworts mit Token fehlt.
2. **Doppelte E-Mail bei Registrierung:** Einheitlicher Statuscode (z. B. 409) wäre hilfreich, damit das Frontend eine gezielte Meldung zeigen kann.
3. **Einstellungen geräteübergreifend:** Nur nötig, falls die Einstellungen synchronisiert werden sollen.
4. **Bulk-Löschen erledigter Aufgaben:** Optional, siehe `DELETE /tasks/{id}`.
5. **Filter per Query-Parameter:** Optional, wenn die Aufgabenmenge wächst.
