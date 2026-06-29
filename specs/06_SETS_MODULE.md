# Sets

## Overview

A **set** is one performed working set — a `{ weight, repetitions }` pair — done
within a performed `exercise` of a `trainment` session. Sets are the leaf records
that the app's progress/metrics features aggregate over.

Each performed `exercise` carries a **`planned_sets` JSONB** (authored per session
on the device — see the [Exercises module](./05_EXERCISES_MODULE.md); the
`exercise_template` stores no prescription) that defines, per set index, the
**placeholder weight** and the **rep range** (`min_reps` / `max_reps`). This JSONB
drives the UI placeholders and **defines how many sets the exercise has**: the
number of `set` rows for an exercise must always equal the number of keys in its
`planned_sets`.

```
trainment (session)
  └─ exercise (performed)               planned_sets JSONB (placeholders/plan)
       ├─ planned_sets = {              ┌───────────────────────────────────┐
       │    "1": { weight: 80, min_reps: 6, max_reps: 12 },                 │
       │    "2": { weight: 80, min_reps: 6, max_reps: 12 },                 │
       │    "3": { weight: 80, min_reps: 6, max_reps: 12 } }                │
       └─ set[]  (actual performance, one row per planned index)            │
            set#1 index=1 weight=80 reps=12                                 │
            set#2 index=2 weight=80 reps=11                                 │
            set#3 index=3 weight=82 reps=8                                  │
```

Architecture: layered SOLID. Requires a signed-in user
([`00_AUTH_MODULE`](./00_AUTH_MODULE.md)); every set is scoped to its owner.
Depends on the [Exercises module](./05_EXERCISES_MODULE.md) (`05`) for the
`exercise` entity and its `planned_sets` column, and on the
[Trainment module](./01_TRAINMENT_MODULE.md) for `trainment`.

## Entity: `set`

Table `sets`.

| Field          | Type            | Notes                                                    |
|----------------|-----------------|----------------------------------------------------------|
| `id`           | `string` (uuid) | Primary key.                                             |
| `trainment_id` | `string` (uuid) | FK → `trainments.id`. Denormalized (the session).        |
| `exercise_id`  | `string` (uuid) | FK → `exercises.id`. The performed exercise this set belongs to. |
| `user_id`      | `string` (uuid) | FK → `users.id`. Denormalized owner.                     |
| `index`        | `int`           | **1-based set index** — maps to the `planned_sets` key; primary ordering. |
| `weight`       | `float \| null` | Actual weight lifted. `null` ⇒ not yet logged (UI shows `0`). Raw number; kg/lb is display. |
| `repetitions`  | `int \| null`   | Actual reps. `null` ⇒ not yet logged (UI shows `0`).    |
| `performed_at` | `DateTime`      | When this set was logged. Default `now()`. Secondary ordering key. |

- **Unique** `(exercise_id, index)` — one set per index per exercise.
- Sets are **ordered by `index`** (canonical); `performed_at` is a valid
  secondary/fallback ordering (chronological).
- `user_id` is always taken from the **JWT** (`jwt.sub`), never the request body.
- `trainment_id` and `exercise_id` **come from the client payload** — in the
  offline-first flow (see Sync) the device generates these UUIDs, so no
  pre-insert lookup is needed. The server still forces `user_id = jwt.sub` and
  relies on FK integrity + a single ownership check on the root `trainment`
  (not a query per set) to keep rows consistent and non-cross-user.

```prisma
model Set {
  id           String   @id @default(uuid())
  trainment    Trainment @relation(fields: [trainment_id], references: [id])
  trainment_id String
  exercise     Exercise  @relation(fields: [exercise_id], references: [id])
  exercise_id  String
  user         User      @relation(fields: [user_id], references: [id])
  user_id      String
  index        Int
  weight       Float?
  repetitions  Int?
  performed_at DateTime  @default(now())

  @@unique([exercise_id, index])
  @@map("sets")
}
```

## The `exercise.planned_sets` JSONB contract

Owned by the Exercises module, specified here because it governs set count and
defaults.

```jsonc
{
  "1": { "weight": null, "min_reps": null, "max_reps": null },
  "2": { "weight": 80,   "min_reps": 6,    "max_reps": 12 },
  "3": { "weight": 80,   "min_reps": 8,    "max_reps": 8 }
}
```

- **Keys** are stringified, **1-based, contiguous** set indices (`"1".."N"`).
- **Values:** `weight`, `min_reps`, `max_reps` — each **nullable, `null` by
  default**; the UI renders a `null` as a `0` placeholder. When set,
  `min_reps`/`max_reps` are integers (`min_reps == max_reps` allowed for a fixed
  target) and `weight` is a number.
- It is **authored per session** (offline-first, optionally pre-filled from the
  user's previous performance). The `exercise_template` stores no prescription, so
  there is nothing to drift — each exercise's `planned_sets` is self-contained and
  immutable history.
- `N = Object.keys(planned_sets).length` is the authoritative **number of sets**.
- The values are **placeholders/UX support only** — actual performance lives in
  the `set` rows.

## Core invariant

> For any exercise `e`: `count(sets where exercise_id = e) === Object.keys(e.planned_sets).length`,
> and every `set.index` is a valid key (`1..N`) with no gaps or duplicates.

Postgres can't easily enforce this, so it is enforced in the **use-cases**: sets
are created/removed only in lockstep with `planned_sets` keys.

## Functional Requirements

1. **Materialize sets** — when a performed `exercise` is created (with its
   `planned_sets`), one `set` row per planned index exists. In the **offline-first
   flow these rows are built on-device** and arrive via batch
   [Sync](./07_OFFLINE_SYNC_MODULE.md); a server-side
   `CreateSetsForExerciseUseCase` covers the online path. Newly materialized,
   unlogged sets have `weight = null`, `repetitions = null` (UI shows `0`).
2. **Log/update a set** — the user records the actual `weight` / `repetitions`
   for a set; `performed_at` is set to now.
3. **List sets** — for an exercise (ordered by `index`), or for a whole session.
4. **Add a set** — append index `N+1` to an exercise (extends `planned_sets`
   *and* inserts the matching `set` row), for sets beyond the original plan.
5. **Remove a set** — drop the **last** index `N` (shrinks `planned_sets` *and*
   deletes the matching `set` row), keeping indices contiguous.

## Endpoints

| Method | Path                          | Auth       | Purpose                                  |
|--------|-------------------------------|------------|------------------------------------------|
| GET    | `/exercises/:exerciseId/sets` | Bearer JWT | List an exercise's sets (by `index`).    |
| PATCH  | `/sets/:id`                   | Bearer JWT | Log/update actual weight & reps.         |
| POST   | `/exercises/:exerciseId/sets` | Bearer JWT | Add an extra set (extends the plan).     |
| DELETE | `/sets/:id`                   | Bearer JWT | Remove the last set (shrinks the plan).  |
| GET    | `/trainments/:trainmentId/sets` | Bearer JWT | All sets in a session (optional).      |

### PATCH `/sets/:id`

- Body (at least one of): `{ weight?: number >= 0, repetitions?: int >= 0, performedAt?: ISO datetime }`.
- `200 OK` → `{ set: { id, exerciseId, index, weight, repetitions, performedAt } }`.
- `404`/`403` on missing/non-owned.

```typescript
const updateSetBodySchema = z
  .object({
    weight: z.number().min(0).optional(),
    repetitions: z.number().int().min(0).optional(),
    performedAt: z.coerce.date().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: 'Provide at least one field' })
```

### POST `/exercises/:exerciseId/sets`

- Body (optional placeholders for the new planned entry):
  `{ weight?: number, minReps?: int, maxReps?: int }` (default from the previous
  set's plan if omitted).
- Appends `planned_sets["N+1"]` and creates the `set` row at `index = N+1`.
- `201 Created` → the new set.

### DELETE `/sets/:id`

- Only the **highest** `index` may be removed (to keep `1..N` contiguous).
- Removes the `set` row and its `planned_sets` key. `204 No Content`.
- `409` (`InvalidSetIndexError`) if it isn't the last index.

## Use-cases (unit-tested in isolation)

Each depends on repository interfaces via the constructor; wired by `make...`
factories.

- `CreateSetsForExerciseUseCase` — given an exercise + its `planned_sets`,
  bulk-create the `set` rows (one per key). Establishes the invariant.
- `UpdateSetUseCase` — load set, assert ownership, update `weight`/`repetitions`
  /`performed_at`.
- `FetchSetsByExerciseUseCase` — ordered by `index`; ownership-checked.
- `FetchSetsByTrainmentUseCase` — all sets for a session (uses `trainment_id`).
- `AddSetToExerciseUseCase` — extend `planned_sets` and insert the new `set`
  together (transactional), preserving the invariant.
- `RemoveSetFromExerciseUseCase` — delete the last `set` and its plan key
  together; reject if not the last index.

> `Add`/`Remove` mutate both the `exercise.planned_sets` JSONB and the `sets`
> rows, so they coordinate with the Exercises module's repository. Run the two
> writes in a single transaction so the invariant can never be observed broken.

## Repository

```typescript
export interface SetsRepository {
  createMany(data: Prisma.SetUncheckedCreateInput[]): Promise<Set[]>
  findById(id: string): Promise<Set | null>
  findManyByExerciseId(exerciseId: string): Promise<Set[]>   // ordered by index
  findManyByTrainmentId(trainmentId: string): Promise<Set[]>
  countByExerciseId(exerciseId: string): Promise<number>
  save(set: Set): Promise<Set>
  delete(id: string): Promise<void>
}
```

Implementations under `in-memory/` (unit tests) and `prisma/` (runtime).

## Business Rules

- **Set-count invariant** (above) holds at all times; `Add`/`Remove` are the only
  ways to change the count and they edit `planned_sets` and `sets` together.
- `index` is 1-based, contiguous, unique per exercise.
- Ownership enforced on every read/write — a user only touches sets belonging to
  their own exercises/trainments (`NotAllowedError`).
- `weight >= 0`, `repetitions >= 0` when present; both may be `null` (unlogged).
- `user_id` always comes from the JWT; `trainment_id`/`exercise_id` come from the
  client payload (client-generated UUIDs offline). The server forces
  `user_id = jwt.sub` and validates ownership of the **root trainment** once,
  rather than a lookup per set.
- `planned_sets` values are placeholders/UX only and never substitute for an
  unlogged `set`'s actual values in analytics (an unlogged set counts as not
  performed, not as its placeholder).

## Error cases

| Error                   | HTTP | When                                              |
|-------------------------|------|---------------------------------------------------|
| `ResourceNotFoundError` | 404  | Set/exercise not found.                           |
| `NotAllowedError`       | 403  | Set/exercise belongs to another user.             |
| `InvalidSetIndexError`  | 409  | Removing a non-last set, or an index gap/dup.     |
| `ZodError`              | 400  | Body/params fail validation.                      |

## Testing expectations

**Unit tests** (in-memory repos, required for every use-case):

- Create sets for exercise: materializes exactly `N` rows for `N` plan keys, with
  `weight`/`repetitions` null (unlogged) and `index` 1..N.
- Update set: writes actual weight/reps and `performed_at`; ownership enforced;
  `ResourceNotFoundError` when absent.
- Fetch by exercise: returns sets ordered by `index`.
- Add set: count goes `N → N+1`, new row at `index N+1`, `planned_sets` extended.
- Remove set: only the last index removed (`N → N-1`); removing a middle index
  → `InvalidSetIndexError`.
- Invariant: after any add/remove, `countByExerciseId === keys(planned_sets)`.

**E2E tests** (real `app` + supertest + isolated Postgres schema — required
because new controllers are added):

- `GET /exercises/:id/sets` → the materialized sets in index order.
- `PATCH /sets/:id` with `{ weight, repetitions }` → `200`; a re-`GET` reflects it.
- `POST /exercises/:id/sets` → `201`; the exercise now lists one more set.
- `DELETE /sets/:id` on the last set → `204`; on a non-last set → `409`.
- A second user accessing another's set → `403`.

## Out of scope / open questions

- **Set index — DECIDED:** `index` is included (1-based, canonical ordering);
  `performed_at` is a valid secondary/chronological ordering.
- **Unlogged values — DECIDED:** `weight`/`repetitions` are nullable (`null` =
  not yet logged); the UI renders `null` as `0`. Likewise `planned_sets`
  `weight`/`min_reps`/`max_reps` are nullable, `0` in the UI.
- **Lockstep model — KEPT:** "set count must equal `planned_sets` length", with
  `Add`/`Remove` editing both together. (Alternative decoupled model noted in #2
  of the discussion; not chosen.)
- **`planned_sets` location:** lives on the performed `exercise` (authored per
  session; the `exercise_template` carries no plan). The column is owned by the
  Exercises module (`05`); this spec defines its contract.
- **Weight unit:** stored as a raw number; kg/lb conversion is display-only via
  [user preferences](./02_USER_PREFERENCES_MODULE.md).
- **Deleting performed sets:** hard delete (no `deleted_at` on `set`, per your
  field list). Revisit if you want recoverable history.
