# Metrics

## Overview

**Per-set progress diffs** between the same exercise across a user's consecutive
sessions of the same workout. For each set, we store the signed change in
**weight** and **repetitions** vs. the corresponding set in the previous session
— the "+2kg", "−1 rep" badges that make progress visible. This delivers the
`planning/main.md` goal: *"see diff metrics between the last 2 trainments of the
same nature (e.g. Upper A, Lower B)."*

Example:

```
24/06  Upper A · Bench Press   60kg ×12, 60kg ×10, 60kg ×11
29/06  Upper A · Bench Press   62kg ×12, 62kg ×10, 62kg ×11
        ⇒ metric per set: weight_diff = +2, repetitions_diff = 0   (×3 sets)
```

Metrics are **computed asynchronously** via the [Events](./08_EVENTS_MODULE.md)
module (a `COMPUTE_TRAINMENT_METRICS` event enqueued on finish/sync), because one
trainment produces a metric per set and we don't want that on the request path.
**Eventual consistency is fine** — results may appear a few seconds/minutes later.

Architecture: layered SOLID. Depends on [Trainment](./01_TRAINMENT_MODULE.md)
(`01`), [Exercises](./05_EXERCISES_MODULE.md) (`05`), [Sets](./06_SETS_MODULE.md)
(`06`), and [Events](./08_EVENTS_MODULE.md) (`08`).

## Entity: `metrics`

Your fields: `id, user_id, trainment_id, exercise_id, previous_set_id,
current_set_id, created_at` — plus the two signed diff columns (the actual
payload).

| Field              | Type             | Notes                                                       |
|--------------------|------------------|-------------------------------------------------------------|
| `id`               | `string` (uuid)  | Primary key.                                                |
| `user_id`          | `string` (uuid)  | FK → `users.id`. Owner.                                     |
| `trainment_id`     | `string` (uuid)  | FK → `trainments.id`. The **current** session.             |
| `exercise_id`      | `string` (uuid)  | FK → `exercises.id`. The current performed exercise.        |
| `previous_set_id`  | `string` (uuid)  | FK → `sets.id`. The compared set from the previous session. |
| `current_set_id`   | `string` (uuid)  | FK → `sets.id`. The current set. **Unique** (one metric per current set). |
| `weight_diff`      | `float`          | Signed: `current.weight − previous.weight` (e.g. `+2`, `-2.5`). |
| `repetitions_diff` | `int`            | Signed: `current.repetitions − previous.repetitions`.       |
| `created_at`       | `DateTime`       | Default `now()`.                                            |

- **Unique `current_set_id`** — makes the async handler **idempotent** (upsert).
- Signed values support both progress (`+`) and regression (`−`), per your ask.

> **`weight_diff` is `Float`** (not `int`) to match `set.weight` (`Float`, module
> `06`) so 2.5kg increments aren't lost. `repetitions_diff` is `Int`. You said
> "integers" — confirm if you'd rather round weight diffs to whole numbers.

```prisma
model Metric {
  id               String   @id @default(uuid())
  user             User      @relation(fields: [user_id], references: [id])
  user_id          String
  trainment        Trainment @relation(fields: [trainment_id], references: [id])
  trainment_id     String
  exercise         Exercise  @relation(fields: [exercise_id], references: [id])
  exercise_id      String
  previousSet      Set       @relation("PreviousSetMetric", fields: [previous_set_id], references: [id])
  previous_set_id  String
  currentSet       Set       @relation("CurrentSetMetric", fields: [current_set_id], references: [id])
  current_set_id   String    @unique
  weight_diff      Float
  repetitions_diff Int
  created_at       DateTime  @default(now())

  @@map("metrics")
}
```

> `Set` (module `06`) needs the two named back-relations; `User`/`Trainment`/
> `Exercise` need a `metrics Metric[]` back-relation.

## Comparison logic (the core)

For a finished **current** trainment `T` (from template `TT`), handled by
`ComputeTrainmentMetricsUseCase`:

1. **Find the previous session `P`** — the user's most recent *other* trainment
   with the **same `trainment_template_id`**, with `started_at < T.started_at`
   (and `finished_at != null`). If none, **stop** (first time → no metrics).
2. **Match exercises by slot** — for each performed `exercise` `E` in `T`, find
   `E_prev` in `P` with the **same `exercise_template_id`** (same Bench-Press slot
   in Upper A). No match ⇒ skip `E`.
3. **Match sets by `index`** — for each `set` `S` in `E`, find `S_prev` in `E_prev`
   with the same `index`. No match (set counts differ) ⇒ skip `S`.
4. **Compute & upsert** — if both `S` and `S_prev` have non-null `weight`/
   `repetitions`, upsert a metric:
   `weight_diff = S.weight − S_prev.weight`,
   `repetitions_diff = S.repetitions − S_prev.repetitions`,
   keyed on `current_set_id = S.id`.

Idempotent by construction (upsert on `current_set_id`), so re-processing the
event is harmless.

> "Previous of the same nature" = same **template** + same **exercise slot**,
> matched **set-by-set by index** — exactly the 24/06↔29/06 Upper A example.

## Functional Requirements

1. **Compute on finish/sync** — the `COMPUTE_TRAINMENT_METRICS` handler runs the
   comparison above and persists the diffs. (Producer/queue = module `08`.)
2. **Read a session's metrics** — the diffs for a finished trainment (to render
   per-set badges).
3. **Read an exercise's metrics** — diffs for one performed exercise.

## Endpoints (read-only)

| Method | Path                                  | Auth       | Purpose                               |
|--------|---------------------------------------|------------|---------------------------------------|
| GET    | `/trainments/:trainmentId/metrics`    | Bearer JWT | Per-set diffs for a session.          |
| GET    | `/exercises/:exerciseId/metrics`      | Bearer JWT | Per-set diffs for one performed exercise. |

- `200 OK` → `{ metrics: [{ exerciseId, previousSetId, currentSetId, weightDiff, repetitionsDiff }] }`.
- `404`/`403` on missing/non-owned; if metrics aren't computed yet, returns an
  empty list (they're eventually consistent).

> No create/update/delete endpoints — metrics are **derived**, written only by the
> async handler.

## Use-cases

- `ComputeTrainmentMetricsUseCase` — the event handler (registered in `08`).
  Implements the comparison logic; idempotent upserts. Depends on
  `TrainmentsRepository`, `ExercisesRepository`, `SetsRepository`,
  `MetricsRepository` (all via interfaces).
- `FetchTrainmentMetricsUseCase` — metrics for a session; ownership-checked.
- `FetchExerciseMetricsUseCase` — metrics for a performed exercise; ownership-checked.

## Repository

```typescript
export interface MetricsRepository {
  upsertByCurrentSetId(data: Prisma.MetricUncheckedCreateInput): Promise<Metric>
  findManyByTrainmentId(trainmentId: string): Promise<Metric[]>
  findManyByExerciseId(exerciseId: string): Promise<Metric[]>
}
```

Implementations under `in-memory/` (unit tests) and `prisma/` (runtime; upsert on
the unique `current_set_id`).

## Business Rules

- Metrics are **computed, never user-edited**.
- One metric per `current_set_id` (idempotent recompute).
- Diffs are **signed** (`current − previous`): positive = more weight/reps,
  negative = less.
- Comparison scope: **same user, same `trainment_template`, same
  `exercise_template` slot, matched by set `index`**.
- A metric requires a comparable previous set; first-ever performances yield no
  metric (the absence is the "baseline" signal).
- Unlogged sets (`null` weight/reps, module `06`) are skipped — no metric.
- Computed asynchronously; the read endpoints tolerate "not yet computed" by
  returning an empty list.

## Error cases

| Error                   | HTTP | When                                            |
|-------------------------|------|-------------------------------------------------|
| `ResourceNotFoundError` | 404  | Trainment/exercise not found (read endpoints).  |
| `NotAllowedError`       | 403  | Resource owned by another user.                 |
| `ZodError`              | 400  | Params fail validation.                         |

Handler-side failures (e.g. transient DB errors during compute) are not HTTP
errors — they flow through the Events retry/`FAILED` machinery (`08`).

## Testing expectations

**Unit tests** (in-memory repos, required for `ComputeTrainmentMetricsUseCase`):

- Two sessions, same template/exercise, +2kg across 3 sets → 3 metrics with
  `weight_diff = +2`, `repetitions_diff = 0`.
- Same weight, fewer reps → negative `repetitions_diff`.
- No previous session → no metrics.
- Mismatched set counts → metrics only for matched indices.
- Unlogged (`null`) sets → skipped.
- Idempotency: running the handler twice → identical metrics, no duplicates.
- Read use-cases: return a session's/exercise's metrics; enforce ownership.

**E2E tests** (real `app` + supertest + isolated Postgres schema):

- Create/sync two Upper-A sessions with progressing Bench Press, **drain the event
  queue** (via `08`'s `ProcessNextEventUseCase` test helper), then
  `GET /trainments/:secondId/metrics` → per-set `weightDiff: 2`.
- `GET /trainments/:firstId/metrics` (no previous) → `200` with `[]`.
- Cross-user `GET …/metrics` → `403`.

## Out of scope / open questions

- **`weight_diff` type — CONFIRM:** `Float` to match `set.weight`; switch to `Int`
  only if you want whole-number weight diffs.
- **Set-count changes between sessions:** unmatched indices get no metric (above).
  An alternative (compare against the previous session's *last* set, or best set)
  is a product decision — deferred.
- **Aggregated progress / charts:** per-exercise time series (volume-load trends,
  PRs) — a later read model over `metrics`/`sets`; this module covers the per-set
  diffs only. Aligns with Improvements **D3** ([`04`](./04_IMPROVEMENTS_MODULE.md)).
- **`previous_trainment_id` in event metadata:** the handler resolves "previous"
  itself; pre-storing it in the event `metadata` is a possible optimization.
- **Which previous session:** strictly the immediately-previous same-template
  session. "Same exercise across *different* templates" comparisons are out of
  scope.
