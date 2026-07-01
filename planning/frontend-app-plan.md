# Reps — Mobile App Action Plan (React Native + Expo)

Client for the `reps-backend` API. This plan is split into a **Phase 0 foundation**
plus **7 feature slices** (matching the backend modules). Each slice lists the
screens, the exact backend endpoints it consumes, the local state it owns, and a
checklist of granular tasks with acceptance criteria.

## Stack & conventions

- **Expo (managed)** + **expo-router** (file-based navigation).
- **axios** — one configured instance, auth + refresh interceptors.
- **@tanstack/react-query** — all *server* state (fetching, caching, mutations).
- **zustand** + **@react-native-async-storage/async-storage** — all *local/offline*
  state (auth session, the active trainment being built, the offline sync queue).
- **expo-secure-store** — the JWT access token (never AsyncStorage for the token).
- **react-native-uuid** (or `crypto.randomUUID` via `expo-crypto`) — client-side id
  generation so records are idempotent across offline → online sync.
- **@react-native-community/netinfo** — connectivity detection for offline-first.

> **Rule of thumb:** React Query owns anything the server is the source of truth for.
> Zustand + AsyncStorage owns anything created offline that hasn't been persisted to
> the server yet. Never duplicate one in the other.

---

## Phase 0 — Foundation (do this first)

Everything else depends on this. No feature work until Phase 0 is green.

- [ ] **Scaffold** `npx create-expo-app` with `expo-router`, TypeScript template.
- [ ] **Folder structure**
  ```
  src/
    api/            # axios instance + typed endpoint fns
    lib/            # queryClient, storage, uuid, netinfo helpers
    stores/         # zustand stores (auth, active-trainment, sync-queue)
    features/       # one folder per slice below
    components/     # shared UI
  app/              # expo-router routes
  ```
- [ ] **Env / config**: `EXPO_PUBLIC_API_URL` pointing at the Render URL
  (`https://reps-backend-api.onrender.com`). Read via `process.env.EXPO_PUBLIC_API_URL`.
- [ ] **axios instance** (`src/api/client.ts`)
  - `baseURL` from env, `timeout`, JSON defaults.
  - **Request interceptor**: attach `Authorization: Bearer <accessToken>` from the
    auth store.
  - **Response interceptor**: on `401`, call the refresh flow once, retry the
    original request; on repeated failure, clear session → redirect to login.
- [ ] **React Query client** (`src/lib/queryClient.ts`): sensible `staleTime`
  (e.g. 30s), `retry` off for `4xx`, wrap app in `QueryClientProvider`.
- [ ] **Secure storage helpers** for the access token (get/set/clear).
- [ ] **UUID + NetInfo helpers**.
- [ ] **Typed API layer**: mirror the DTOs in the [API Reference](#api-reference)
  appendix as TS types so every endpoint fn is typed.

> ⚠️ **Auth/refresh design decision — resolve in Phase 0.** The backend issues the
> access token in the JSON body (`{ token }`) but sets the **refresh token in an
> httpOnly cookie**, and `PATCH /token/refresh` reads it via `onlyCookie: true`.
> React Native's networking does **not** transparently persist httpOnly cookies the
> way a browser does. Pick one:
> 1. **Client cookie persistence** — use `@react-native-cookies/cookies` +
>    axios `withCredentials`, and let the cookie ride on `/token/refresh`. Least
>    backend change, most RN fragility (esp. iOS).
> 2. **Backend tweak (recommended)** — add support for the refresh token in the
>    response body + `Authorization`/body on `/token/refresh`, store it in
>    SecureStore. Cleanest for mobile. *(Small, isolated backend change — flag to
>    the team.)*
> Document the choice here before building the login screen.

---

## Slice 1 — Users / Auth module

**Screens:** Sign Up, Sign In, (Splash/Auth-gate that bootstraps the session).

**Endpoints:**
| Action | Method | Path | Body → Response |
|---|---|---|---|
| Register | `POST` | `/users` | `{ username, email, password }` → `201` (no body) |
| Sign in | `POST` | `/sessions` | `{ email, password }` → `200 { token }` (+ refresh cookie) |
| Refresh | `PATCH` | `/token/refresh` | (cookie) → `200 { token }` |
| Change password | `PATCH` | `/users/password` | *auth* — (see backend) |

**Local state (zustand `authStore`, persisted):** `accessToken`, `status`
(`'loading' | 'authenticated' | 'unauthenticated'`), `user` (decode from JWT `sub`/`role`).

- [ ] `authStore` with `signIn`, `signOut`, `setToken`, `bootstrap`.
- [ ] **Sign Up screen** — form (username/email/password, min 6), validation, calls
  register, on `201` auto-signs-in (POST `/sessions`) then routes home. Handle `409`
  (user exists) inline.
- [ ] **Sign In screen** — form, calls `/sessions`, stores token in SecureStore,
  sets `authenticated`. Handle `400` (invalid credentials) inline.
- [ ] **Auth gate** (root layout): on launch, load token from SecureStore, attempt a
  silent refresh; route to `(auth)` or `(app)` stack accordingly.
- [ ] **Refresh integration** wired into the axios `401` interceptor (per Phase 0 decision).
- [ ] **Sign out** — clear SecureStore + store + React Query cache.
- [ ] **(Optional) Change password** screen → `PATCH /users/password`.
- **Acceptance:** cold start with a valid token lands on Home without a login prompt;
  expired token silently refreshes; invalid refresh routes to Sign In.

---

## Slice 2 — Create trainment template + add catalog exercises

**Screens:** Create Template (name), Template Editor (its exercise list + "Add
exercise"), Catalog Picker (searchable list with muscle-group filter).

**Endpoints:**
| Action | Method | Path | Notes |
|---|---|---|---|
| Create template | `POST` | `/trainment-templates` | `{ title }` → `201 { trainmentTemplate }` |
| Search catalog | `GET` | `/catalog/exercises?q=&muscleGroup=&page=` | `→ { exercises[], page, total }` |
| Catalog detail | `GET` | `/catalog/exercises/:id` | optional |
| Add exercise to template | `POST` | `/trainment-templates/:id/exercises` | `{ exerciseCatalogId }` → `201 { exerciseTemplate }` |
| List template exercises | `GET` | `/trainment-templates/:id/exercises` | `→ { ... }` |
| Remove exercise | `DELETE` | `/exercise-templates/:id` | |

- [ ] **Create Template** mutation → on success navigate to the editor for the new id.
- [ ] **Catalog Picker**: `useInfiniteQuery` over `searchExercises` (paginated by
  `page`, uses `total` for hasNextPage); debounced `q` search; `muscleGroup` filter
  chips (the 12 enum values); render `title` + `imageUrl`.
- [ ] **Add exercise** mutation → invalidate the template's exercise list query.
- [ ] **Template Editor**: list current exercises (`fetchTemplateExercises`),
  cross-reference `exerciseCatalogId` against cached catalog for image/muscle
  (the template DTO only returns `title`/ids). Support remove (with confirm).
- **Acceptance:** create a template, add 3 exercises from catalog, see them listed,
  remove one; all reflected without manual refresh (query invalidation).

---

## Slice 3 — List templates

**Screen:** Templates list (entry point for starting a workout & editing).

**Endpoints:** `GET /trainment-templates` → `{ trainmentTemplate[] }`
(`id, title, createdAt, updatedAt`); `DELETE /trainment-templates/:id`;
`PATCH /trainment-templates/:id` (rename).

- [ ] `useQuery(['templates'])` → list with title + relative updated time.
- [ ] Row actions: **Start** (→ Slice 5), **Edit** (→ Slice 2 editor), **Delete**
  (confirm → mutation → invalidate).
- [ ] Empty state → CTA to create the first template.
- **Acceptance:** newly created templates appear; delete removes them optimistically.

---

## Slice 4 — Home: latest trainments + weekly progress

**Screen:** Home dashboard.

**Endpoints:**
| Action | Method | Path | Response |
|---|---|---|---|
| Latest trainments | `GET` | `/trainments?page=1` | `{ trainments[], page }` |
| Weekly progress | `GET` | `/trainments/weekly-progress` | `{ weekStart, weekEnd, completed, goal, trainments[] }` |

- [ ] **Weekly progress card**: `completed` / `goal` ring or bar (goal may be `null`
  → show "set a goal" hint linking to preferences).
- [ ] **Latest trainments list**: `useInfiniteQuery(['trainments'])` (paginated),
  show template title (join via cached templates), started/finished timestamps,
  "in progress" if `finishedAt === null`.
- [ ] Pull-to-refresh → invalidate both queries.
- [ ] Tapping a trainment → detail (`GET /trainments/:id`, `/exercises`, `/sets`).
- **Acceptance:** finishing a workout (Slice 5) updates Home counts after sync.

---

## Slice 5 — Register a new trainment (OFFLINE-FIRST) ⭐

The core flow. The **entire session is built locally in zustand + AsyncStorage** and
only hits the network at "Finish". If offline at finish, it's parked in a pending
queue and drained by a background poller.

**Primary endpoint:** `POST /trainments/sync` — persists the whole session graph
**atomically & idempotently** (keyed by the client-generated `id`).
- `201` on first sync, `200` on idempotent re-sync (same `id`) → safe to retry.
- Errors: `404` (template/exercise not found), `403` (not owner), `409`
  (`SyncConflictError` / `InvalidSetIndexError`).

**Exact payload contract (validated server-side — match it precisely):**
```jsonc
{
  "id": "<uuid>",                    // client-generated, stable across retries
  "trainmentTemplateId": "<uuid>",
  "startedAt": "<ISO date>",
  "finishedAt": "<ISO date|null>",
  "exercises": [
    {
      "id": "<uuid>",                // client-generated
      "exerciseTemplateId": "<uuid>",// from the template's exercises (Slice 2)
      "plannedSets": {               // keys are contiguous "1".."N"
        "1": { "weight": 60, "min_reps": 8, "max_reps": 12 },
        "2": { "weight": 60, "min_reps": 8, "max_reps": 12 }
      },
      "sets": [                      // MUST be same count as plannedSets keys
        { "id": "<uuid>", "index": 1, "weight": 60, "repetitions": 10, "performedAt": "<ISO>" },
        { "id": "<uuid>", "index": 2, "weight": 60, "repetitions": 9,  "performedAt": "<ISO>" }
      ]
    }
  ]
}
```
> **Server invariants you must satisfy locally before sync:** per exercise,
> `sets.length === Object.keys(plannedSets).length`, and both `sets[].index` and the
> `plannedSets` keys are **contiguous `1..N`**. Validate on-device before enqueuing to
> avoid `409`s.

**Local state:**
- `activeTrainmentStore` (zustand, persisted to AsyncStorage key `active_trainment`):
  the in-progress session — `id`, `trainmentTemplateId`, `startedAt`, `exercises[]`
  each with `plannedSets` + performed `sets[]`. All ids generated up front.
- `syncQueueStore` (persisted to AsyncStorage key **`pending_trainments_sync`**):
  array of completed session payloads awaiting upload.

Tasks:
- [ ] **Start session** (from Slice 3 "Start"): seed `activeTrainmentStore` from the
  template — generate trainment `id`, copy exercises (with their `exerciseTemplateId`),
  set `startedAt = now`. Hydrate exercise metadata (title/image) from cached catalog.
- [ ] **Session screen**: per exercise, add/edit/remove sets; each set edit updates
  both the planned entry and the performed entry; keep indices contiguous on removal
  (re-index `1..N`). Fully functional with **no network**.
- [ ] **Auto-persist** the active session to AsyncStorage on every change (survives
  app kill / crash mid-workout → resume on next launch).
- [ ] **Finish button** → set `finishedAt = now`, build the sync payload, run the
  local invariant validation, then:
  - **Online** → `POST /trainments/sync`; on `2xx` clear `active_trainment`,
    invalidate `['trainments']` + `['weekly-progress']`.
  - **Offline** (NetInfo says no connection, or the request fails) → push payload into
    `pending_trainments_sync`, clear `active_trainment`, show "will sync when online".
- [ ] **Background sync poller** (`useSyncQueue` hook mounted at app root):
  - Trigger on: app foreground, NetInfo regains connectivity, and an interval fallback.
  - For each queued payload: `POST /trainments/sync`; on `200/201` remove it from the
    queue (idempotent — safe even if it was partially sent before); on `409` surface a
    conflict resolution (drop or flag); on network error keep it and back off.
  - Process sequentially; guard against concurrent drains (in-flight flag).
- [ ] **Pending indicator** in UI (badge/count of `pending_trainments_sync`).
- **Acceptance:** turn on airplane mode, complete a full workout, hit Finish → it lands
  in `pending_trainments_sync`; re-enable network → poller drains it and it appears in
  Home; re-running the drain twice never creates duplicates (idempotent `id`).

---

## Slice 6 — Exercise metrics (default: last month)

Show per-exercise progress metrics, defaulting to the **last month**. Metrics are
set-to-set diffs (`weightDiff`, `repetitionsDiff`, `previousSetId`, `currentSetId`).

**Endpoint:** `GET /exercises/:id/metrics` → `{ metrics[] }` where `:id` is a
**performed exercise id** (not a template/catalog id).

> ⚠️ **API gap to flag.** This endpoint returns metrics for **one performed exercise**
> and has **no date-range/aggregation param**. "Last month per exercise" therefore
> requires the client to fan out: list last-month trainments → their exercises →
> metrics per exercise, then group by `exerciseTemplateId`/catalog. That's N+1 chatty.
> **Recommended:** ask the backend for an aggregated endpoint, e.g.
> `GET /metrics/exercises?from=&to=` returning per-catalog-exercise summaries. Until
> then, implement the client-side composition below.

- [ ] **Period selector** (Last month default; also 3m / all).
- [ ] **Data assembly** (client-side, until the aggregated endpoint exists):
  - Fetch trainments in range (`GET /trainments?page=` filtered by `finishedAt`).
  - For each, `GET /trainments/:id/exercises`, then `GET /exercises/:id/metrics`.
  - Group by exercise (catalog) → reduce to totals/trends. Cache aggressively with
    React Query (long `staleTime`, per-exercise query keys).
- [ ] **Metrics screen**: per exercise, show latest weight/rep deltas and a simple trend.
- [ ] Loading/skeletons given the multi-request fan-out; error boundaries per exercise.
- **Acceptance:** with last month's workouts, each trained exercise shows its
  weight/rep progression; switching period refetches.
- [ ] **Backend follow-up ticket:** aggregated metrics-by-period endpoint (removes the
  N+1). *Tracked separately from this app plan.*

---

## Slice 7 — Progress charts (Coming soon)

**Screen:** placeholder tab/section.

- [ ] "Coming soon" screen with the tab entry in place (no data wiring).
- [ ] Leave a stub `features/charts/` with a note pointing at the Slice 6 aggregated
  endpoint as the future data source (charting lib TBD, e.g. `victory-native` /
  `react-native-svg`).
- **Acceptance:** tab visible, clearly marked upcoming, ships without backend work.

---

## Cross-cutting checklist

- [ ] Global error handling (toast on `5xx`, inline on `4xx`).
- [ ] Auth gate hides `(app)` routes when unauthenticated.
- [ ] React Query devtools in dev.
- [ ] Loading/empty/error states for every list.
- [ ] Offline banner (NetInfo) app-wide.
- [ ] Type-safe API layer kept in sync with the appendix below.

---

## API Reference (appendix)

All routes except `POST /users`, `POST /sessions`, `PATCH /token/refresh` require
`Authorization: Bearer <token>`. Base URL: `EXPO_PUBLIC_API_URL`.

**Auth**
- `POST /users` `{ username, email, password }` → `201`
- `POST /sessions` `{ email, password }` → `200 { token }` (+ refresh cookie)
- `PATCH /token/refresh` (refresh cookie) → `200 { token }`
- `PATCH /users/password` *(auth)*

**Preferences** (used by Home goal & settings)
- `GET /preferences` → `{ weightUnit, theme, lengthUnit, weeklyTrainingCount }`
- `PATCH /preferences` (partial) same shape; `weeklyTrainingCount` int 1–14 or `null`

**Catalog**
- `GET /catalog/exercises?q=&muscleGroup=&page=` → `{ exercises: [{ id, title, slug, muscleGroup, imageUrl }], page, total }`
- `GET /catalog/exercises/:id`
- `muscleGroup` enum: `CHEST, BACK, SHOULDERS, BICEPS, TRICEPS, FOREARMS, CORE, QUADS, HAMSTRINGS, GLUTES, CALVES, FULL_BODY`

**Templates**
- `POST /trainment-templates` `{ title }` → `201 { trainmentTemplate: { id, title, createdAt, updatedAt } }`
- `GET /trainment-templates` → `{ trainmentTemplate[] }`
- `GET|PATCH|DELETE /trainment-templates/:id`
- `POST /trainment-templates/:id/exercises` `{ exerciseCatalogId }` → `201 { exerciseTemplate: { id, trainmentTemplateId, exerciseCatalogId, title, createdAt } }`
- `GET /trainment-templates/:id/exercises`
- `DELETE /exercise-templates/:id`

**Trainments**
- `POST /trainments` `{ trainmentTemplateId }` → `201 { trainment }` *(online start; the offline path uses `/sync` instead)*
- `POST /trainments/sync` → see Slice 5 contract; `201`/`200`, errors `404/403/409`
- `PATCH /trainments/:id/finish`
- `GET /trainments?trainmentTemplateId=&page=` → `{ trainments[], page }`
- `GET /trainments/weekly-progress` → `{ weekStart, weekEnd, completed, goal, trainments[] }`
- `GET /trainments/:id` → `{ trainment: { id, trainmentTemplateId, userId, startedAt, finishedAt } }`
- `GET /trainments/:id/exercises` → `{ ... exercise: { id, trainmentId, exerciseTemplateId, plannedSets, createdAt } }`
- `GET /trainments/:id/sets`, `GET /trainments/:id/metrics`

**Exercises / Sets (performed)**
- `POST /trainments/:id/exercises`, `GET /exercises/:id`, `DELETE /exercises/:id`
- `GET|POST /exercises/:id/sets`, `PATCH|DELETE /sets/:id`
- `set` DTO: `{ id, trainmentId, exerciseId, index, weight, repetitions, performedAt }`

**Metrics**
- `GET /exercises/:id/metrics` → `{ metrics: [{ id, trainmentId, exerciseId, previousSetId, currentSetId, weightDiff, repetitionsDiff }] }`

> **Note on the online per-set endpoints** (`POST /exercises/:id/sets`, etc.): these
> exist for an online-incremental flow, but the mobile app is **offline-first**, so the
> primary write path is the single atomic `POST /trainments/sync`. Prefer `/sync`; treat
> the granular endpoints as optional/advanced.
