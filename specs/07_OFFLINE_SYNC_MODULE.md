# Offline-First Trainment Sync

## Overview

**Assume the user has no connectivity during a workout** (no gym wifi, weak
signal, no mobile data). The app is **offline-first**: the whole session —
the `trainment`, its `exercise`s, and every `set` — is recorded in device local
storage with **client-generated UUIDs**, and later pushed to the server in **one
atomic transaction** when connectivity returns.

**Client lifecycle (confirmed):** the session lives entirely on-device during the
workout. When the user taps **Finish**, the app sets `finished_at`, calls
`POST /trainments/sync` **once**, and on a successful (`2xx`) response **deletes
the local-storage copy**. Consequences: sync always carries an already-*finished*
session, and a lost/failed response is safe — the device still holds the data and
retries the same idempotent payload.

This module owns that sync operation. It is the **primary write path** for
completed sessions; the per-entity endpoints in the
[Trainment](./01_TRAINMENT_MODULE.md), Exercises (`05`), and
[Sets](./06_SETS_MODULE.md) modules cover incremental online editing.

It realizes differentiator **D5 (offline-first reliability)** from
[04_IMPROVEMENTS_MODULE](./04_IMPROVEMENTS_MODULE.md): *never lose a workout.*

Architecture: layered SOLID. The `trainment` is treated as the **aggregate root**
— persisting it persists its exercises and sets as one unit.

## Sync contract

1. **Client-generated UUIDs.** The device assigns the `id` of the trainment,
   each exercise, and each set offline. So all foreign keys inside the payload
   resolve **without any server lookup**, and the same ids are reused on retry.
2. **Atomic per trainment.** A sync persists exactly one trainment graph inside a
   single DB transaction, in order **trainment → (for each exercise) exercise →
   that exercise's sets**. Any failure rolls back the entire graph — never a
   half-written session.
3. **Idempotent.** Re-sending the same payload (after a dropped response, retry,
   or duplicate tap) must not create duplicates. Achieved via **upsert on the
   client-generated ids** (see Idempotency).
4. **Server owns identity & ownership.** `user_id` on every row is forced from
   the JWT (`jwt.sub`); the client never supplies it. Device-supplied
   `started_at` / `finished_at` / `performed_at` are trusted as *when it
   happened*.

## Endpoint

| Method | Path                | Auth       | Purpose                                   |
|--------|---------------------|------------|-------------------------------------------|
| POST   | `/trainments/sync`  | Bearer JWT | Persist one offline trainment graph atomically. |

- `201 Created` (first time) / `200 OK` (idempotent re-sync) → the persisted
  graph with server-confirmed ids and timestamps.
- `207`-style partial results are **not** used: a trainment graph is all-or-nothing.

> Multiple offline trainments are synced by calling this endpoint once **per
> trainment** (each its own transaction), so one bad session can't block the
> others. A `POST /trainments/sync/batch` wrapping N independent transactions is
> an optional convenience (see open questions).

## Payload shape

```jsonc
{
  "id": "c0ffee00-...",                 // client-generated trainment id
  "trainmentTemplateId": "aaaa-...",    // must already exist & be owned by user
  "startedAt": "2026-06-29T18:02:11Z",  // device clock
  "finishedAt": "2026-06-29T18:54:03Z", // null if still in progress
  "exercises": [
    {
      "id": "1111-...",                 // client-generated exercise id
      "exerciseTemplateId": "eeee-...", // must exist & belong to the same template
      "plannedSets": {                  // snapshot; keys 1..N, values nullable
        "1": { "weight": 80, "min_reps": 6, "max_reps": 12 },
        "2": { "weight": 80, "min_reps": 6, "max_reps": 12 }
      },
      "sets": [
        { "id": "aaaa-...", "index": 1, "weight": 80, "repetitions": 12, "performedAt": "2026-06-29T18:05:00Z" },
        { "id": "bbbb-...", "index": 2, "weight": 82, "repetitions": 9,  "performedAt": "2026-06-29T18:08:30Z" }
      ]
    }
  ]
}
```

Validated with Zod (shape + the per-exercise invariant):

```typescript
const setSchema = z.object({
  id: z.uuid(),
  index: z.number().int().min(1),
  weight: z.number().min(0).nullable(),
  repetitions: z.number().int().min(0).nullable(),
  performedAt: z.coerce.date(),
})

const exerciseSchema = z.object({
  id: z.uuid(),
  exerciseTemplateId: z.uuid(),
  plannedSets: z.record(z.string(), z.object({
    weight: z.number().nullable(),
    min_reps: z.number().int().nullable(),
    max_reps: z.number().int().nullable(),
  })),
  sets: z.array(setSchema),
}).refine(
  (e) => e.sets.length === Object.keys(e.plannedSets).length,
  { message: 'sets count must equal plannedSets length' },
).refine(
  (e) => {
    const idx = e.sets.map((s) => s.index).sort((a, b) => a - b)
    return idx.every((v, i) => v === i + 1) // contiguous 1..N, no dups
  },
  { message: 'set indices must be contiguous 1..N' },
)

const syncTrainmentBodySchema = z.object({
  id: z.uuid(),
  trainmentTemplateId: z.uuid(),
  startedAt: z.coerce.date(),
  finishedAt: z.coerce.date().nullable(),
  exercises: z.array(exerciseSchema),
})
```

## Transaction semantics

Inside a single `prisma.$transaction`:

1. **Upsert the trainment** (by `id`), forcing `user_id = jwt.sub`.
2. **For each exercise:** upsert the exercise (by `id`), then **upsert its sets**
   (by `id`, or by `(exercise_id, index)`).
3. **Record a `COMPUTE_TRAINMENT_METRICS` event** ([`08`](./08_EVENTS_MODULE.md))
   for `{ trainmentId }` — insert the `events` row **inside this same transaction**
   (outbox); its BullMQ job is dispatched **after commit** (the sweeper backstops
   a missed enqueue). So a synced session always gets
   [metrics](./09_METRICS_MODULE.md) queued.
4. Commit. On any error, the whole transaction rolls back.

Ordering guarantees FKs exist before children reference them (trainment before
exercises, exercise before its sets).

## Idempotency

- **Primary mechanism:** client-generated UUID primary keys + **upsert**. A
  retry re-applies the same ids → updates in place, no duplicates. Re-syncing an
  unchanged graph is a no-op that returns `200`.
- The unique `(exercise_id, index)` on `sets` is a second guard against
  duplicate set rows.
- **Optional:** an `Idempotency-Key` header (the trainment id) for an explicit
  "already processed" short-circuit. Not required given UUID upserts.

## Ownership & validation (before/within the transaction)

- `trainmentTemplateId` **must exist and belong to `jwt.sub`** — one ownership
  check on the root (`NotAllowedError` / `ResourceNotFoundError`), not per child.
- Every `exerciseTemplateId` must exist and belong to that template.
- Per-exercise **invariant**: `sets.length === keys(plannedSets).length`, indices
  contiguous `1..N` (enforced in Zod above and re-asserted in the use-case).
- `user_id` is overwritten with `jwt.sub` on all rows regardless of payload.
- The entire request is rejected (no partial writes) if any check fails.

## Use-case & repository

- `SyncTrainmentUseCase` — validates ownership + invariants, normalizes
  `user_id`, then delegates persistence to a single transactional repository
  call. Stays persistence-agnostic (no Prisma import).

```typescript
export interface TrainmentSyncRepository {
  // Persists the whole graph atomically (upsert trainment -> exercises -> sets).
  persistTrainmentGraph(graph: TrainmentGraph): Promise<Trainment>
}
```

- **Prisma impl** wraps everything in `prisma.$transaction([...])` (or an
  interactive transaction) with upserts in the documented order.
- **In-memory impl** (for unit tests) applies the graph all-or-nothing to its
  arrays (validate first, then commit; throw before mutating on any error) so the
  atomicity contract is testable without a DB.

> The aggregate is persisted by **one** repository method rather than juggling
> three repositories in the use-case — that keeps the transaction boundary in the
> persistence layer and the use-case clean (DDD aggregate-root persistence).

## Business Rules

- A synced trainment must reference an **existing, owned** template (consistent
  with the Trainment module rule: trainments come from templates).
- Atomic: trainment + all exercises + all sets, or nothing.
- Idempotent on the client-generated ids.
- Device timestamps are authoritative for *when* the work happened; the server
  may additionally stamp its own received-at if auditing is desired (optional;
  not in the current entity specs).
- Sync is triggered by **Finish**, so `finishedAt` is normally already set on
  arrival. The schema still permits `finishedAt: null` (e.g. a future "sync
  mid-session for safety" feature), and a later re-sync can populate it via upsert.

## Error cases

| Error                    | HTTP | When                                                   |
|--------------------------|------|--------------------------------------------------------|
| `ResourceNotFoundError`  | 404  | Referenced template / exercise_template not found.     |
| `NotAllowedError`        | 403  | Template (or its exercise_template) owned by another user. |
| `ZodError`               | 400  | Payload shape or per-exercise invariant fails.         |
| `SyncConflictError`      | 409  | An id already exists with a conflicting owner/shape that upsert can't reconcile. |

On any error the transaction rolls back; the client keeps its local copy and may
retry safely.

## Testing expectations

**Unit tests** (in-memory `TrainmentSyncRepository`, required):

- Happy path: a graph with 1 trainment, 2 exercises, N sets each persists; ids
  preserved; `user_id` set from the caller.
- Atomicity: a graph whose 2nd exercise violates the invariant persists **nothing**
  (trainment + first exercise are rolled back) and throws.
- Idempotency: syncing the same graph twice yields one trainment, no duplicate
  sets; the second call is a no-op/update.
- Ownership: a `trainmentTemplateId` owned by another user → `NotAllowedError`,
  nothing written.
- `user_id` from payload is ignored/overwritten with the authenticated user.

**E2E tests** (real `app` + supertest + isolated Postgres schema — required,
new controller):

- Seed a template + exercise_templates; `POST /trainments/sync` with a full graph
  → `201`; `GET /trainments/:id` and `GET /exercises/:id/sets` reflect it.
- Re-`POST` the identical payload → `200`, and the DB row counts are unchanged
  (idempotent).
- A graph referencing another user's template → `403`, and a follow-up `GET`
  shows nothing was written.
- A graph with `sets.length !== plannedSets` length → `400`, nothing written.

## Out of scope / open questions

- **Offline-created templates — DECIDED (MVP):** `trainment_template` and
  `exercise_template` are assumed to **already exist** on the server
  (created/synced while online); the offline payload carries only the *performed*
  graph. Creating a brand-new template fully offline is **out of scope for MVP**
  — if added later, the payload would also carry and upsert the template +
  exercise_templates first.
- **Concurrency — DECIDED (MVP):** each device is bound to a single user and a
  given record is only ever written from that one device, so **no race
  conditions / overwrites** are expected. UUID-upsert last-write-wins is
  sufficient; **no `version`/optimistic-concurrency control is needed** for MVP.
- **Batch of trainments:** `POST /trainments/sync/batch` running N independent
  transactions (one per trainment) so a single bad session doesn't block the rest.
- **Server received-at / sync audit:** optional `synced_at` columns are not in
  the current entity specs; add if you want sync auditing.
- **Pull/down-sync:** this module is **push-only** (device → server). Fetching
  server state back to a fresh device reuses the existing `GET` history endpoints.
