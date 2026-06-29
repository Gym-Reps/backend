# Trainment

## Overview

The core training model: **templates** the user defines (their "Upper A",
"Lower B") and the **sessions** they actually perform against those templates on
a given day. This module owns exactly two entities:

1. **`trainment_template`** — a user-owned, named plan (e.g. "Upper A").
2. **`trainment`** — a performed session based on a template (e.g. "Upper A,
   started 29/06/2026").

> **Scope boundary:** the *plan side* details (`exercise_template`) and the
> *performed side* details (`exercise`, `set`) are defined in **other modules**.
> Linkage (confirmed):
> - `exercise_template` → `trainment_template`  (plan: which exercises a template prescribes)
> - `exercise` → `trainment`  (performed: which exercises were done in a session)
> - `set` → `exercise`
>
> A performed `exercise` also references the `exercise_template` it realizes, so
> the plan↔performed correspondence is reachable **without** a direct
> `exercise → trainment_template` link.

Architecture: layered SOLID (Fastify controllers → factories → use-cases →
repository interface → Prisma). Requires a signed-in user
([`00_AUTH_MODULE`](./00_AUTH_MODULE.md)) — every template/trainment is scoped to
`request.user.sub`.

## Entities

### `trainment_template`

| Field        | Type               | Notes                                       |
|--------------|--------------------|---------------------------------------------|
| `id`         | `string` (uuid)    | Primary key.                                |
| `user_id`    | `string` (uuid)    | FK → `users.id`. Owner.                     |
| `title`      | `string`           | Display name, e.g. "Upper A".               |
| `created_at` | `DateTime`         | Default `now()`.                            |
| `updated_at` | `DateTime`         | Auto-updated; bumps on rename **and** when its exercises change. |
| `deleted_at` | `DateTime \| null` | Soft-delete marker. `null` ⇒ active.        |

Has many `trainment`s and many `exercise_template`s (other module). **No** direct
link to exercises/sets.

Templates are **mutable and long-lived**: users rename them and add/remove
exercises over time, and can retire them. Editing the exercise composition
(adding/removing `exercise_template`s) lives in the exercise-template module, but
that operation should **bump this template's `updated_at`**. Deletion is a
**soft delete** so historical `trainment`s that reference the template stay
intact.

### `trainment`

| Field                   | Type               | Notes                                            |
|-------------------------|--------------------|--------------------------------------------------|
| `id`                    | `string` (uuid)    | Primary key.                                     |
| `trainment_template_id` | `string` (uuid)    | FK → `trainment_templates.id`. The plan it follows. |
| `user_id`               | `string` (uuid)    | FK → `users.id`. Owner (denormalized for fast history queries). |
| `started_at`            | `DateTime`         | When the session began. Default `now()`.         |
| `finished_at`           | `DateTime \| null` | When completed. `null` ⇒ in progress.            |

Has many `exercise`s (other module).

### Schema delta (vs. current `prisma/schema.prisma`)

The current schema already has `TrainmentTemplate` and `Trainment`, but they
differ from this spec and must be reconciled:

- **`TrainmentTemplate`**: rename `name` → **`title`**; **keep**
  `updated_at` and `deleted_at` (templates are editable + soft-deletable).
- **`Trainment`**: add **`started_at`** (default `now()`) and **`finished_at`**
  (nullable); the current `created_at`/`updated_at`/`deleted_at` are replaced by
  the session-timing fields per this spec.

```prisma
model TrainmentTemplate {
  id         String    @id @default(uuid())
  user       User      @relation(fields: [user_id], references: [id])
  user_id    String
  title      String
  created_at DateTime  @default(now())
  updated_at DateTime  @updatedAt
  deleted_at DateTime?

  trainments        Trainment[]
  exerciseTemplates ExerciseTemplate[] // defined in the exercise-template module

  @@map("trainment_templates")
}

model Trainment {
  id                    String    @id @default(uuid())
  trainmentTemplate     TrainmentTemplate @relation(fields: [trainment_template_id], references: [id])
  trainment_template_id String
  user                  User      @relation(fields: [user_id], references: [id])
  user_id               String
  started_at            DateTime  @default(now())
  finished_at           DateTime?

  exercises Exercise[] // defined in the exercise module

  @@map("trainments")
}
```

> Reconciling these models touches relations referenced by `ExerciseTemplate`
> and `Exercise` already present in the schema — keep those relation fields
> intact when migrating.

## Functional Requirements

1. **Create template** — a user creates a `trainment_template` with a `title`.
2. **List templates** — a user lists their own active templates.
3. **Get template** — fetch one of the user's templates by id.
4. **Rename template** — a user updates a template's `title`.
5. **Delete template** — a user soft-deletes a template; historical trainments
   that reference it are preserved.
6. **Start a trainment** — a user starts a session **from one of their
   templates**; `started_at` is set, `finished_at` is `null`.
7. **Finish a trainment** — a user marks an in-progress session finished
   (`finished_at = now()`).
8. **List trainment history** — a user lists their performed sessions
   (optionally filtered by template), most recent first.
9. **Get trainment** — fetch one of the user's sessions by id.

> Adding/removing exercises *within* a template is the exercise-template
> module's responsibility; it bumps this template's `updated_at`.

## Endpoints

| Method | Path                       | Auth       | Purpose                              |
|--------|----------------------------|------------|--------------------------------------|
| POST   | `/trainment-templates`     | Bearer JWT | Create a template.                   |
| GET    | `/trainment-templates`     | Bearer JWT | List the user's active templates.    |
| GET    | `/trainment-templates/:id` | Bearer JWT | Get one template.                    |
| PATCH  | `/trainment-templates/:id` | Bearer JWT | Rename a template.                   |
| DELETE | `/trainment-templates/:id` | Bearer JWT | Soft-delete a template.              |
| POST   | `/trainments`              | Bearer JWT | Start a session from a template.     |
| PATCH  | `/trainments/:id/finish`   | Bearer JWT | Finish an in-progress session.       |
| GET    | `/trainments`              | Bearer JWT | List session history (filterable).   |
| GET    | `/trainments/weekly-progress` | Bearer JWT | This week's performed sessions + goal. |
| GET    | `/trainments/:id`          | Bearer JWT | Get one session.                     |

> Register `/trainments/weekly-progress` **before** `/trainments/:id` so the
> literal path isn't captured by the `:id` param.

### POST `/trainment-templates`

- Body: `{ title: string (1..) }`.
- `201 Created` → `{ trainmentTemplate: { id, title, createdAt } }`.

### GET `/trainment-templates`

- `200 OK` → `{ trainmentTemplates: [...] }` (only the caller's **active**,
  i.e. `deleted_at IS NULL`).

### PATCH `/trainment-templates/:id` — rename

- Body: `{ title: string (1..) }`.
- `200 OK` → `{ trainmentTemplate: { ..., title, updatedAt } }`.
- `404`/`403` on missing/non-owned.

### DELETE `/trainment-templates/:id` — soft delete

- Sets `deleted_at = now()`; does **not** remove rows. Past `trainment`s that
  reference it remain readable.
- `204 No Content`.
- `404`/`403` on missing/non-owned.

### POST `/trainments` — start a session

- Body: `{ trainmentTemplateId: string (uuid) }`.
- `201 Created` → `{ trainment: { id, trainmentTemplateId, startedAt, finishedAt: null } }`.
- `404` if the template doesn't exist; `403` if it belongs to another user.

### PATCH `/trainments/:id/finish`

- No body. Sets `finished_at = now()`.
- `200 OK` → `{ trainment: { ..., finishedAt } }`.
- `404`/`403` on missing/non-owned; `409` (`TrainmentAlreadyFinishedError`) if
  already finished.

### GET `/trainments`

- Query: `trainmentTemplateId?` (filter), `page?` (default `1`, size `20`).
- `200 OK` → `{ trainments: [...], page }`, ordered by `started_at` desc.

### GET `/trainments/weekly-progress`

- Returns the **current week (Monday 00:00 → Sunday 23:59:59.999)** of *performed*
  sessions, plus the goal for the progress bar.
- "Performed" = `finished_at != null` within the week.
- `200 OK` →

  ```jsonc
  {
    "weekStart": "2026-06-29T00:00:00Z",  // Monday
    "weekEnd":   "2026-07-05T23:59:59Z",  // Sunday
    "completed": 2,                        // finished sessions this week
    "goal": 3,                             // weeklyTrainingCount, or null
    "trainments": [ /* the week's finished sessions, newest first */ ]
  }
  ```

- `goal` is read from the user's [preferences](./02_USER_PREFERENCES_MODULE.md)
  (`weeklyTrainingCount`, may be `null`).

## Use-cases (unit-tested in isolation)

Each depends on repository **interfaces** via the constructor and is wired by a
`make...` factory to the Prisma implementations.

- `CreateTrainmentTemplateUseCase` — create a template for `userId`.
- `FetchUserTrainmentTemplatesUseCase` — list the user's active templates.
- `GetTrainmentTemplateUseCase` — fetch by id; `ResourceNotFoundError` if
  missing/soft-deleted, `NotAllowedError` if not the owner.
- `UpdateTrainmentTemplateUseCase` — rename; ownership-checked; bumps
  `updated_at`.
- `DeleteTrainmentTemplateUseCase` — soft-delete (set `deleted_at`);
  ownership-checked; idempotent on an already-deleted template.
- `StartTrainmentUseCase` — load the template, assert ownership, create a
  `trainment` with `started_at = now()`, `finished_at = null`.
- `FinishTrainmentUseCase` — load the trainment, assert ownership, reject if
  already finished, set `finished_at = now()`, and **enqueue a
  `COMPUTE_TRAINMENT_METRICS` event** ([`08`](./08_EVENTS_MODULE.md)) so
  [metrics](./09_METRICS_MODULE.md) are computed asynchronously.
- `FetchUserTrainmentsUseCase` — list the user's sessions (optional template
  filter, paginated, newest first).
- `GetTrainmentUseCase` — fetch by id with ownership check.
- `GetWeeklyProgressUseCase` — compute the current Mon–Sun window, fetch the
  user's finished sessions in it, read `weeklyTrainingCount` from preferences, and
  return `{ weekStart, weekEnd, completed, goal, trainments }`.

## Repositories

```typescript
export interface TrainmentTemplatesRepository {
  create(data: Prisma.TrainmentTemplateUncheckedCreateInput): Promise<TrainmentTemplate>
  findById(id: string): Promise<TrainmentTemplate | null> // excludes soft-deleted
  findManyByUserId(userId: string): Promise<TrainmentTemplate[]> // active only
  save(template: TrainmentTemplate): Promise<TrainmentTemplate> // rename + soft-delete
}

export interface TrainmentsRepository {
  create(data: Prisma.TrainmentUncheckedCreateInput): Promise<Trainment>
  findById(id: string): Promise<Trainment | null>
  findManyByUserId(
    userId: string,
    params: { trainmentTemplateId?: string; page: number },
  ): Promise<Trainment[]>
  // finished sessions in [start, end] — powers weekly-progress
  findFinishedByUserIdInPeriod(userId: string, start: Date, end: Date): Promise<Trainment[]>
  save(trainment: Trainment): Promise<Trainment>
}
```

Implementations under `in-memory/` (unit tests) and `prisma/` (runtime).
`findFinishedByUserIdInPeriod` powers `GET /trainments/weekly-progress`.

## Business Rules

- **A trainment can only be created from an existing template owned by the same
  user** (matches `planning/main.md`: "Trainments must be only created from
  trainment templates").
- Ownership is enforced on every read/write: a user never sees or mutates
  another user's templates or trainments (`NotAllowedError`).
- **Templates are soft-deleted**, never hard-deleted: `delete` sets `deleted_at`.
  Active-template reads (`findById`, list) exclude `deleted_at != null`, but a
  past `trainment` can still resolve its (now-deleted) template for history.
  Starting a new trainment from a soft-deleted template is rejected
  (`ResourceNotFoundError`).
- `started_at` defaults to `now()` on creation; `finished_at` stays `null` until
  the session is finished. A session cannot be finished twice.
- **Weekly progress bar** (from [02_USER_PREFERENCES_MODULE](./02_USER_PREFERENCES_MODULE.md)):
  `GET /trainments/weekly-progress` derives the *completed-this-week* count here —
  `findFinishedByUserIdInPeriod` over the current **Monday→Sunday** window — and
  combines it with the user's `weeklyTrainingCount` goal (nullable). "Completed"
  means **`finished_at != null`** within the week.

## Error cases

| Error                          | HTTP | When                                        |
|--------------------------------|------|---------------------------------------------|
| `ResourceNotFoundError`        | 404  | Template/trainment id not found.            |
| `NotAllowedError`              | 403  | Resource belongs to another user.           |
| `TrainmentAlreadyFinishedError`| 409  | Finishing an already-finished session.      |
| `ZodError`                     | 400  | Body/query/params fail validation.          |

## Testing expectations

**Unit tests** (in-memory repos, required for every use-case):

- Create template: persists for the user.
- Fetch templates: returns only the caller's; excludes other users'.
- Get template: returns it; `ResourceNotFoundError` when absent;
  `NotAllowedError` when owned by someone else.
- Rename template: updates `title` for the owner; ownership enforced.
- Delete template: sets `deleted_at`; subsequent get/list exclude it; starting a
  trainment from it is rejected; a past trainment still resolves it.
- Start trainment: creates a session with `finished_at = null` from an owned
  template; `ResourceNotFoundError`/`NotAllowedError` for missing/non-owned
  template.
- Finish trainment: sets `finished_at`; `TrainmentAlreadyFinishedError` on a
  second finish; ownership enforced.
- Fetch trainments: newest-first; filters by `trainmentTemplateId`; paginates.
- Weekly progress: counts only the user's **finished** sessions inside the
  current Mon–Sun window; returns the goal from preferences (incl. `null`);
  excludes other weeks and in-progress sessions.

**E2E tests** (real `app` + supertest + isolated Postgres schema — required
because new controllers are added):

- `POST /trainment-templates` → `201`; `GET /trainment-templates` returns it.
- `PATCH /trainment-templates/:id` → `200` with the new title; `GET` reflects it.
- `DELETE /trainment-templates/:id` → `204`; the template no longer appears in
  `GET /trainment-templates`, and `POST /trainments` against it → `404`.
- `POST /trainments` with an owned `trainmentTemplateId` → `201`,
  `finishedAt: null`.
- `POST /trainments` with another user's template → `403` (and a non-existent
  one → `404`).
- `PATCH /trainments/:id/finish` → `200` with `finishedAt` set; finishing again
  → `409`.
- `GET /trainments?trainmentTemplateId=...` → only that template's sessions.
- `GET /trainments/weekly-progress` → `200` with `completed` = number of finished
  sessions this Mon–Sun, `goal` from preferences, and the week's `trainments`;
  a session finished last week is excluded.

## Out of scope / open questions

- **Week timezone:** the Mon–Sun window — is it computed in **UTC** or the
  user's local timezone? With no per-user timezone stored yet, MVP uses UTC (or a
  single configured app timezone). Add a user timezone if week boundaries must be
  local. ("Completed" = `finished_at != null`, week = Mon–Sun are now decided.)
- **Empty/abandoned sessions:** a `trainment` started but never finished (and
  with no exercises) — pruning/auto-expiry is out of scope for now.
- `exercise_template`, `exercise`, and `set` entities, and snapshotting a
  template's planned exercises into a started session, are defined in their own
  modules and reference the FKs established here.
- **Offline-first creation:** completed sessions recorded offline are persisted
  as one atomic graph via [07_OFFLINE_SYNC_MODULE](./07_OFFLINE_SYNC_MODULE.md)
  (`POST /trainments/sync`). The `POST /trainments` + `PATCH .../finish`
  endpoints here are the incremental online path.
