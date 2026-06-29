# Exercises (exercise_template + exercise)

## Overview

The link between a **plan** and a **performed session**. This module owns two
user-scoped entities:

1. **`exercise_template`** — a **planned exercise slot** inside a
   `trainment_template` (e.g. "Squat" in "Upper A"). It's a lightweight named
   reference to a [catalog](./03_EXERCISE_CATALOG_MODULE.md) exercise; it stores
   **no** set prescription.
2. **`exercise`** — a **performed exercise** inside a `trainment` session. It
   carries the `planned_sets` JSONB (the per-session set plan / UI placeholders)
   and is the parent of the actual `set` rows ([module 06](./06_SETS_MODULE.md)).

```
trainment_template "Upper A"                 trainment "Upper A @ 29/06"
  └─ exercise_template "Squat"                 └─ exercise (performed)
       ├─ exercise_catalog_id -> catalog            ├─ exercise_template_id -> "Squat"
       ├─ title "Squat"                             ├─ planned_sets (per-session plan/placeholders)
       └─ soft-deletable (remove from plan)         └─ set[] (actual weight/reps)  ← module 06
```

Architecture: layered SOLID. Requires a signed-in user
([`00_AUTH_MODULE`](./00_AUTH_MODULE.md)); ownership flows through the parent
`trainment_template` / `trainment` (both carry `user_id`). Depends on
[Trainment](./01_TRAINMENT_MODULE.md) (`01`) and the
[Catalog](./03_EXERCISE_CATALOG_MODULE.md) (`03`); feeds [Sets](./06_SETS_MODULE.md)
(`06`) and [Sync](./07_OFFLINE_SYNC_MODULE.md) (`07`).

> **Route note:** performed exercises live at `/exercises/:id`. The catalog has
> been moved to `/catalog/exercises` (see `03`) to free this namespace.

## Entities

### `exercise_template` (plan slot)

Your fields: `id`, `title`, `exercise_catalog_id`, `created_at` — plus two kept
for structural reasons (flagged ⚠).

| Field                   | Type               | Notes                                                       |
|-------------------------|--------------------|-------------------------------------------------------------|
| `id`                    | `string` (uuid)    | Primary key.                                                |
| `trainment_template_id` | `string` (uuid)    | **⚠ kept** — FK → `trainment_templates.id`. The link you confirmed; without it the slot has no parent plan. |
| `exercise_catalog_id`   | `string \| null`   | FK → `default_exercises.id` (the catalog, module `03`). `null` ⇒ a custom off-catalog exercise. |
| `title`                 | `string`           | Display name — the catalog title at add-time, or a custom name. |
| `created_at`            | `DateTime`         | Default `now()`.                                            |
| `deleted_at`            | `DateTime \| null` | **⚠ kept** — soft-delete, so "remove exercise from template" preserves the performed `exercise`s that reference it. |

Stores **no** `planned_sets` — the template is just a reference; the set plan is
decided per session on the `exercise`.

### `exercise` (performed instance)

Your fields: `id`, `trainment_id`, `exercise_template_id`, `created_at` — plus
`planned_sets` (flagged ⚠).

| Field                  | Type            | Notes                                                       |
|------------------------|-----------------|-------------------------------------------------------------|
| `id`                   | `string` (uuid) | Primary key.                                                |
| `trainment_id`         | `string` (uuid) | FK → `trainments.id`. The session it was performed in.      |
| `exercise_template_id` | `string` (uuid) | FK → `exercise_templates.id`. The plan slot it realizes.    |
| `planned_sets`         | `JSONB`         | **⚠ kept** — the per-set plan / placeholders, per your original Sets-module instruction. Required by `06`/`07`. |
| `created_at`           | `DateTime`      | Default `now()`.                                            |

> **⚠ `planned_sets` on `exercise` (confirm).** You didn't re-list it here, but
> your Sets-module instruction said *"each exercise must have a JSONB column like
> `{ 1: { weight, min_reps, max_reps } }`"*, and modules `06`/`07` depend on it
> (it's the UI placeholder source **and** defines the set count). Because the
> `exercise_template` stores no prescription, this `planned_sets` is **authored
> per session on the device** (offline-first, optionally pre-filled from the
> user's previous performance of the same exercise) — it is **not** a template
> snapshot, so it is naturally self-contained and immutable. Drop it only if you
> abandon per-set rep ranges/placeholders entirely.

### Schema delta (vs. current `prisma/schema.prisma`)

Today's `ExerciseTemplate` has both a `sets Json` column **and** a `sets Set[]`
relation — both removed: the template stores no sets, and actual `Set` rows relate
to the performed `exercise` (module `06`).

```prisma
model ExerciseTemplate {
  id                    String    @id @default(uuid())
  trainmentTemplate     TrainmentTemplate @relation(fields: [trainment_template_id], references: [id])
  trainment_template_id String
  defaultExercise       DefaultExercise?  @relation(fields: [exercise_catalog_id], references: [id])
  exercise_catalog_id   String?
  title                 String
  created_at            DateTime  @default(now())
  deleted_at            DateTime?

  exercises Exercise[]

  @@map("exercise_templates")
}

model Exercise {
  id                   String   @id @default(uuid())
  trainment            Trainment @relation(fields: [trainment_id], references: [id])
  trainment_id         String
  exerciseTemplate     ExerciseTemplate @relation(fields: [exercise_template_id], references: [id])
  exercise_template_id String
  planned_sets         Json     @default("{}")
  created_at           DateTime @default(now())

  sets Set[] // module 06

  @@map("exercises")
}
```

> `DefaultExercise` (module `03`) needs a back-relation
> `exerciseTemplates ExerciseTemplate[]` for the optional `exercise_catalog_id`.

## `planned_sets` shape

Lives on `exercise`. Full contract in [06_SETS_MODULE](./06_SETS_MODULE.md):

```jsonc
{
  "1": { "weight": null, "min_reps": null, "max_reps": null },
  "2": { "weight": 80,   "min_reps": 6,    "max_reps": 12 }
}
```

Keys stringified, 1-based, contiguous (`"1".."N"`); values nullable (`null` → UI
shows `0`); `N` = number of sets for that exercise.

## Functional Requirements

**Plan side (`exercise_template`):**
1. **Add exercise to template** — reference a catalog `exerciseCatalogId` *or* a
   custom `title`.
2. **List a template's exercises** — active only (excludes soft-deleted).
3. **Remove an exercise** — soft-delete it from the template.
4. Add/remove **bumps the parent `trainment_template.updated_at`** (the contract
   from `01`).

**Performed side (`exercise`):**
5. **Instantiate** — when a session is performed, each chosen exercise becomes an
   `exercise` with its device-authored `planned_sets`, and its `set` rows are
   materialized (module `06`). Primary path = device builds it and
   [Syncs](./07_OFFLINE_SYNC_MODULE.md); an online path exists too (below).
6. **List a session's exercises** / **get one**.
7. **Remove a performed exercise** from a session (also deletes its sets).

## Endpoints

| Method | Path                                          | Auth       | Purpose                                       |
|--------|-----------------------------------------------|------------|-----------------------------------------------|
| POST   | `/trainment-templates/:templateId/exercises`  | Bearer JWT | Add an exercise slot to a template.           |
| GET    | `/trainment-templates/:templateId/exercises`  | Bearer JWT | List a template's exercises (active).         |
| DELETE | `/exercise-templates/:id`                     | Bearer JWT | Soft-delete (remove from template).           |
| GET    | `/trainments/:trainmentId/exercises`          | Bearer JWT | List a session's performed exercises.         |
| GET    | `/exercises/:id`                              | Bearer JWT | Get one performed exercise.                   |
| POST   | `/trainments/:trainmentId/exercises`          | Bearer JWT | (Online) add a performed exercise to a session. |
| DELETE | `/exercises/:id`                              | Bearer JWT | (Online) remove a performed exercise + its sets. |

### POST `/trainment-templates/:templateId/exercises`

- Body: `{ exerciseCatalogId?: uuid, title?: string }` — exactly one required. If
  `exerciseCatalogId` is given, `title` defaults to the catalog entry's title.
- `201 Created` → the `exercise_template`. Bumps the template's `updated_at`.
- `404`/`403` if the template is missing/non-owned; `404` if `exerciseCatalogId`
  doesn't exist.

### POST `/trainments/:trainmentId/exercises` (online)

- Body: `{ exerciseTemplateId: uuid, plannedSets: PlannedSets }` (device authors
  `plannedSets`).
- Creates the `exercise`, then materializes its `set` rows
  (`CreateSetsForExerciseUseCase`, module `06`).
- `201 Created` → the performed `exercise` (with its sets).

## Use-cases (unit-tested in isolation)

Each depends on repository **interfaces** via the constructor; wired by `make...`
factories.

**Plan side:**
- `AddExerciseToTemplateUseCase` — assert template ownership, resolve catalog
  title if `exerciseCatalogId` set, create the slot, **bump
  `trainment_template.updated_at`**.
- `FetchTemplateExercisesUseCase` — active slots for a template.
- `RemoveExerciseTemplateUseCase` — soft-delete; ownership-checked; bumps parent
  `updated_at`.

**Performed side:**
- `AddExerciseToTrainmentUseCase` — assert trainment + template ownership, create
  the `exercise` with the supplied `planned_sets`, then materialize sets.
- `FetchTrainmentExercisesUseCase` — performed exercises for a session.
- `GetExerciseUseCase` — by id; `ResourceNotFoundError`/`NotAllowedError`.
- `RemoveExerciseFromTrainmentUseCase` — delete the exercise and its sets.

## Repositories

```typescript
export interface ExerciseTemplatesRepository {
  create(data: Prisma.ExerciseTemplateUncheckedCreateInput): Promise<ExerciseTemplate>
  findById(id: string): Promise<ExerciseTemplate | null>            // excludes soft-deleted
  findManyByTemplateId(templateId: string): Promise<ExerciseTemplate[]> // active
  save(exerciseTemplate: ExerciseTemplate): Promise<ExerciseTemplate>   // soft-delete
}

export interface ExercisesRepository {
  create(data: Prisma.ExerciseUncheckedCreateInput): Promise<Exercise>
  findById(id: string): Promise<Exercise | null>
  findManyByTrainmentId(trainmentId: string): Promise<Exercise[]>
  delete(id: string): Promise<void> // cascade its sets
}
```

Implementations under `in-memory/` (unit tests) and `prisma/` (runtime).

## Business Rules

- **Ownership chain:** an `exercise_template` is reachable/mutable only by the
  owner of its `trainment_template`; a performed `exercise` only by the owner of
  its `trainment` (`NotAllowedError` otherwise).
- **`updated_at` propagation:** adding/removing an `exercise_template` bumps its
  parent `trainment_template.updated_at`.
- **`title` is snapshotted** onto the `exercise_template` at add-time, so custom
  exercises and any future catalog drift don't change a saved plan's name.
- **`planned_sets` is per-session and immutable** — authored on the `exercise`
  when performed; the template carries no plan, so nothing can drift.
- **Soft-delete** for `exercise_template` keeps past `exercise`s (which reference
  it) resolvable for history.
- A performed `exercise`'s `planned_sets` must satisfy the module-`06` invariant
  (`count(sets) === keys(planned_sets)`).

## Error cases

| Error                   | HTTP | When                                               |
|-------------------------|------|----------------------------------------------------|
| `ResourceNotFoundError` | 404  | Template / exercise_template / exercise / catalog entry not found. |
| `NotAllowedError`       | 403  | Resource owned by another user.                    |
| `ZodError`              | 400  | Body/params fail validation (incl. the one-of `exerciseCatalogId`/`title`, `planned_sets` shape). |

## Testing expectations

**Unit tests** (in-memory repos, required for every use-case):

- Add to template: from `exerciseCatalogId` (title resolved from catalog) and
  from a custom `title`; parent `updated_at` bumped; non-owned template →
  `NotAllowedError`; unknown catalog id → `ResourceNotFoundError`.
- List template exercises: excludes soft-deleted.
- Remove: ownership enforced; sets `deleted_at`; parent `updated_at` bumped; the
  slot disappears from the list but a past `exercise` still resolves it.
- Add to trainment: creates the exercise with the supplied `planned_sets` and
  materializes the matching number of sets.
- Get/list performed exercises: ownership enforced.
- Remove performed exercise: deletes it and its sets.

**E2E tests** (real `app` + supertest + isolated Postgres schema — required,
new controllers):

- `POST /trainment-templates/:id/exercises` (catalog-based) → `201`; the
  template's `updatedAt` changes; `GET .../exercises` lists it.
- `DELETE /exercise-templates/:id` → `204`; excluded from the list afterward.
- `POST /trainments/:id/exercises` → `201` with `planned_sets` and materialized
  sets; `GET /exercises/:id` returns it.
- Cross-user access to any of the above → `403`.

## Out of scope / open questions

- **`planned_sets` on `exercise` — CONFIRM (see callout):** kept per your original
  Sets instruction; needed by `06`/`07`.
- **Custom (off-catalog) exercises:** `exercise_catalog_id` is **nullable**
  (`null` ⇒ custom, `title` required). Confirm MVP supports custom, or make it
  catalog-only (non-null FK).
- **`planned_sets` pre-fill source:** device authors it; pre-filling from the
  user's last performance of the same exercise is a nice UX default (client-side).
- **Editing/renaming an `exercise_template`:** deferred (no `updated_at` on the
  slot per your field list). Add a `PATCH /exercise-templates/:id` + `updated_at`
  if rename is wanted.
- **Ordering** of exercises within a template/session: not tracked (no
  `order_index`). Add one if exercise order must be preserved/reorderable.
- **Auto-snapshot on `StartTrainment`:** `01`'s online `POST /trainments` could
  auto-instantiate all of a template's exercises in one call; deferred (the
  offline/sync path builds them on-device anyway).
