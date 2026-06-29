# Exercise Catalog (Default Exercises)

## Overview

A curated, pre-seeded catalog of exercises that users **select from** (like
Hevy, Jefit, Strong, FitNotes) instead of each user creating their own. This
keeps the user-owned `exercise_template` table small: templates reference a
catalog entry rather than duplicating its data.

The catalog is **admin-curated and read-mostly** for members. Each entry carries
a lightweight image used purely to help users visually identify the exercise.

Architecture: layered SOLID (Fastify controllers → factories → use-cases →
repository interface → Prisma). Requires a signed-in user
([`00_AUTH_MODULE`](./00_AUTH_MODULE.md)) to browse; create/update is
`ADMIN`-only.

## Naming note — `muscular_group`

Renamed to **`muscle_group`**, representing the *primary* targeted muscle group,
typed as an enum (not a free-form string) so the list stays consistent and
filterable. A future `secondary_muscle_groups` array can be added without
breaking this field (see open questions).

## Entity

Table `default_exercises`.

| Field          | Type           | Notes                                              |
|----------------|----------------|----------------------------------------------------|
| `id`           | `string` (uuid)| Primary key.                                       |
| `title`        | `string`       | Display name, e.g. "Barbell Bench Press".          |
| `slug`         | `string`       | Unique, URL/seed-stable key, e.g. `barbell-bench-press`. |
| `muscle_group` | `MuscleGroup`  | Enum, primary targeted muscle group.               |
| `image_path`   | `string`       | Relative path to the static image (see Storage).   |
| `created_at`   | `DateTime`     | Default `now()`.                                   |
| `updated_at`   | `DateTime`     | Auto-updated on write.                              |

### `MuscleGroup` enum

```
CHEST · BACK · SHOULDERS · BICEPS · TRICEPS · FOREARMS ·
CORE · QUADS · HAMSTRINGS · GLUTES · CALVES · FULL_BODY
```

### Schema delta (vs. current `prisma/schema.prisma`)

Add the enum and model:

```prisma
enum MuscleGroup {
  CHEST
  BACK
  SHOULDERS
  BICEPS
  TRICEPS
  FOREARMS
  CORE
  QUADS
  HAMSTRINGS
  GLUTES
  CALVES
  FULL_BODY
}

model DefaultExercise {
  id           String      @id @default(uuid())
  title        String
  slug         String      @unique
  muscle_group MuscleGroup
  image_path   String
  created_at   DateTime    @default(now())
  updated_at   DateTime    @updatedAt

  @@map("default_exercises")
}
```

**Integration with the trainment module (handled there, noted here):** when a
user adds an exercise to an `exercise_template`, the template should hold a
nullable `default_exercise_id` FK → `default_exercises.id` (plus allow a custom
title for off-catalog exercises). The catalog row is never copied — only
referenced. **Neither `exercise_template` nor the performed `exercise` stores an
image**: the image exists solely on `default_exercises` (a selection/UX aid) and
is reached through `default_exercise_id`.

## Image storage

**Decision: static assets served from the repo via `@fastify/static`** (no S3,
no external object store). The catalog is small, curated, and rarely changes, so
the images ship with the app.

- Images live under `public/exercises/<slug>.webp` — use **WebP**, small
  dimensions (~120–256px), optimized for a list thumbnail ("lightweight image
  just to help the user find the exercise").
- Register static serving under a **`/static/` prefix** (keeps assets off the API
  namespace, so they never collide with `/exercises/:id`):

  ```typescript
  import fastifyStatic from '@fastify/static'
  import path from 'node:path'

  app.register(fastifyStatic, {
    root: path.resolve(process.cwd(), 'public'),
    prefix: '/static/', // -> GET /static/exercises/barbell-bench-press.webp
  })
  ```

- The DB stores only the **relative path**, e.g.
  `image_path = '/static/exercises/barbell-bench-press.webp'`.
- The full URL is composed at read time: `${APP_URL}${image_path}`, where
  `APP_URL` comes from validated env (`src/env`). This keeps the stored value
  host-agnostic and makes it trivial to front the path with a CDN later — or to
  swap to an object store (R2/MinIO) by only changing how the URL is derived.

> Responses should expose the resolved `image_url` (computed), while persistence
> keeps `image_path`.

## Functional Requirements

1. **Browse / search** — an authenticated user can list catalog exercises with
   pagination, a text search on `title`, and an optional `muscle_group` filter.
2. **Get one** — fetch a single catalog exercise by `id` (or `slug`).
3. **Seed** — the catalog is populated by a seed script, not by members.
4. **Admin manage (optional)** — an `ADMIN` can add/update catalog entries.

## Endpoints

> **Route namespace:** catalog routes are under **`/catalog/exercises`** (not
> `/exercises`), so they don't collide with performed exercises (`/exercises/:id`,
> module `05`) or their sets (`/exercises/:id/sets`, module `06`).

| Method | Path                     | Auth        | Purpose                                |
|--------|--------------------------|-------------|----------------------------------------|
| GET    | `/catalog/exercises`     | Bearer JWT  | Search/filter/paginate the catalog.    |
| GET    | `/catalog/exercises/:id` | Bearer JWT  | Get one catalog exercise.              |
| POST   | `/catalog/exercises`     | Bearer + `ADMIN` | Add a catalog entry. *(optional)* |

### GET `/catalog/exercises`

- Query: `q?` (title contains, case-insensitive), `muscleGroup?` (enum),
  `page?` (default `1`, page size `20`).
- `200 OK` → `{ exercises: [{ id, title, slug, muscleGroup, imageUrl }], page, total }`.

  ```typescript
  const searchExercisesQuerySchema = z.object({
    q: z.string().optional(),
    muscleGroup: z.enum([
      'CHEST','BACK','SHOULDERS','BICEPS','TRICEPS','FOREARMS',
      'CORE','QUADS','HAMSTRINGS','GLUTES','CALVES','FULL_BODY',
    ]).optional(),
    page: z.coerce.number().min(1).default(1),
  })
  ```

### GET `/catalog/exercises/:id`

- `200 OK` → `{ exercise: { id, title, slug, muscleGroup, imageUrl } }`.
- `404 Not Found` (`ResourceNotFoundError`) if no such entry.

### POST `/catalog/exercises` *(optional, ADMIN)*

- Guarded by `verifyJWT` + `verifyUserRole('ADMIN')`.
- Body: `{ title, muscleGroup, slug?, imagePath }` (slug derived from title if
  omitted).
- `201 Created`. `409 Conflict` if the slug already exists.

## Use-cases (unit-tested in isolation)

Each depends on `DefaultExercisesRepository` (interface) via the constructor and
is wired by a `make...` factory to the Prisma implementation.

- `SearchExercisesUseCase` — filter by title/muscle group, paginate.
- `GetExerciseUseCase` — fetch by id; throw `ResourceNotFoundError` if missing.
- `CreateExerciseUseCase` *(optional, admin)* — reject duplicate slug.

## Repository

```typescript
export interface DefaultExercisesRepository {
  findMany(params: {
    query?: string
    muscleGroup?: MuscleGroup
    page: number
  }): Promise<{ exercises: DefaultExercise[]; total: number }>
  findById(id: string): Promise<DefaultExercise | null>
  findBySlug(slug: string): Promise<DefaultExercise | null>
  create(data: Prisma.DefaultExerciseUncheckedCreateInput): Promise<DefaultExercise>
}
```

Implementations: `in-memory/in-memory-default-exercises-repository.ts` (unit
tests) and `prisma/prisma-default-exercises-repository.ts` (runtime; use Prisma
`contains` with `mode: 'insensitive'` for search, `skip`/`take` for paging).

## Seeding

Populate the catalog with `prisma/seed.ts` (wired via `prisma.config.ts`),
idempotent with `upsert` keyed on `slug`:

```typescript
const exercises = [
  { title: 'Barbell Bench Press', slug: 'barbell-bench-press',
    muscle_group: 'CHEST', image_path: '/static/exercises/barbell-bench-press.webp' },
  // ...curated list
]
for (const e of exercises) {
  await prisma.defaultExercise.upsert({ where: { slug: e.slug }, update: e, create: e })
}
```

The matching image files are committed under `public/exercises/`.

## Business Rules

- Catalog entries are **not** user-owned; members can only read.
- `slug` is unique and stable — it's the seed/upsert key and safe to reference.
- Responses return a fully-resolved `imageUrl` (`${APP_URL}${image_path}`); the
  raw `image_path` is an internal persistence detail.

## Error cases

| Error                   | HTTP | When                                  |
|-------------------------|------|---------------------------------------|
| `ResourceNotFoundError` | 404  | Exercise id/slug not found.           |
| `ExerciseAlreadyExistsError` | 409 | Duplicate slug on create (admin).  |
| `ZodError`              | 400  | Query/body fails validation.          |

## Testing expectations

**Unit tests** (in-memory repo, required for every use-case):

- Search: returns matches by partial title (case-insensitive); filters by
  `muscleGroup`; paginates (page 2 returns the next slice).
- Get: returns the entry; throws `ResourceNotFoundError` when absent.
- Create (if implemented): creates an entry; rejects a duplicate slug.

**E2E tests** (real `app` + supertest + isolated Postgres schema — required
because new controllers are added):

- Seed a couple of entries, then `GET /catalog/exercises?q=bench` with a valid
  Bearer token → `200` with the expected entry and a resolved `imageUrl`.
- `GET /catalog/exercises/:id` for an unknown id → `404`.
- `GET /catalog/exercises?muscleGroup=CHEST` → only chest entries.
- *(if admin endpoint built)* `POST /catalog/exercises` as `ADMIN` → `201`; as
  `MEMBER` → `401`.

## Out of scope / open questions

- **Secondary muscle groups / equipment / category:** a `secondary_muscle_groups
  MuscleGroup[]` and an `equipment` enum are likely future additions — the
  current single `muscle_group` field is forward-compatible.
- **Custom (off-catalog) exercises:** how members add an exercise not in the
  catalog is the trainment module's concern (custom title on `exercise_template`
  with a null `default_exercise_id`).
- **Image pipeline:** images are hand-optimized and committed for now; if the
  catalog grows large or needs user uploads, revisit an object store
  (Cloudflare R2 / self-hosted MinIO) — the host-agnostic `image_path` keeps
  that swap cheap.
- **Localization:** `title` is English-only for now.
