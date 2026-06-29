# User Preferences

## Overview

Per-user UI/measurement preferences for `reps-backend`: weight unit, theme,
length unit, and a **weekly training goal** (`weeklyTrainingCount`) that powers a
progress bar (workouts completed this week vs. the goal). Each user has exactly
**one** `user_preferences` row, holding the choices in a single `preferences`
JSONB column validated at the edge.

Architecture: layered SOLID (Fastify controllers → factories → use-cases →
repository interface → Prisma). Depends on the auth module
([`00_AUTH_MODULE`](./00_AUTH_MODULE.md)) for the authenticated `user_id`.

## Entity

Table `user_preferences` — one-to-one with `users`.

| Field         | Type                | Notes                                       |
|---------------|---------------------|---------------------------------------------|
| `id`          | `string` (uuid)     | Primary key.                                |
| `user_id`     | `string` (uuid)     | Foreign key → `users.id`. **Unique** (1:1). |
| `preferences` | `JSONB`             | Matches the enums below. Default `{}`.      |
| `created_at`  | `DateTime`          | Default `now()`.                            |
| `updated_at`  | `DateTime`          | Auto-updated on write.                       |

### `preferences` JSONB shape

```jsonc
{
  "weightUnit": "kg",            // "kg" | "lb"
  "theme": "light",              // "dark" | "light" (MVP ships light only)
  "lengthUnit": "meters",        // "meters" | "inches"  (meters = metric, incl. cm)
  "weeklyTrainingCount": null    // integer 1–14, or null = no goal set
}
```

Validated with Zod at the controller (see below):

| Key          | Values             | Default    | Meaning                          |
|--------------|--------------------|------------|----------------------------------|
| `weightUnit` | `kg` \| `lb`       | `kg`       | Kilograms vs. pounds.            |
| `theme`      | `dark` \| `light`  | `light`    | UI theme. **MVP renders `light` only**; `dark` is post-MVP (enum kept for forward-compat). |
| `lengthUnit` | `meters` \| `inches` | `meters` | Metric (meters/cm) vs. imperial (inches). |
| `weeklyTrainingCount` | integer `1`–`14`, **nullable** | `null` | **Goal**: target workouts per week. `null` = no goal set. Drives the progress bar (completed-this-week ÷ this value) when present. |

### Schema delta (vs. current `prisma/schema.prisma`)

Add a new model and a back-relation on `User`:

```prisma
model UserPreferences {
  id          String   @id @default(uuid())
  user        User     @relation(fields: [user_id], references: [id])
  user_id     String   @unique
  preferences Json     @default("{}")
  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt

  @@map("user_preferences")
}
```

On `User`, add the inverse relation:

```prisma
// inside model User
preferences UserPreferences?
```

> The enum constraints live in **application code** (Zod), not in Postgres — the
> column is free-form JSONB. The repository/use-case must never persist values
> outside the allowed sets.

## Functional Requirements

1. **Default on registration** — when a user registers, a `user_preferences`
   row is created with the defaults (`weightUnit: kg`, `theme: light`,
   `lengthUnit: meters`, `weeklyTrainingCount: null`).
2. **Read** — an authenticated user can fetch their current preferences.
3. **Update** — an authenticated user can update any subset of their
   preferences (including the weekly training goal); omitted keys keep their
   existing value.

## Endpoints

| Method | Path           | Auth       | Purpose                          |
|--------|----------------|------------|----------------------------------|
| GET    | `/preferences` | Bearer JWT | Get the current user's preferences. |
| PATCH  | `/preferences` | Bearer JWT | Update (partial) preferences.    |

### GET `/preferences`

- Requires a valid Bearer access token (`verifyJWT`).
- `200 OK` → `{ preferences: { weightUnit, theme, lengthUnit, weeklyTrainingCount } }`.
- If no row exists yet, return the defaults (or `404` — see open questions).

### PATCH `/preferences`

- Requires a valid Bearer access token (`verifyJWT`).
- Body (all optional, at least one required):

  ```jsonc
  {
    "weightUnit": "lb",          // optional, "kg" | "lb"
    "theme": "light",            // optional, "dark" | "light"
    "lengthUnit": "inches",      // optional, "meters" | "inches"
    "weeklyTrainingCount": 5     // optional, integer 1–14
  }
  ```

- `200 OK` → `{ preferences: { ...merged } }`.
- `400 Bad Request` (`ZodError`) on any value outside the allowed set/range.

Validate with Zod, e.g.:

```typescript
const updatePreferencesBodySchema = z
  .object({
    weightUnit: z.enum(['kg', 'lb']).optional(),
    theme: z.enum(['dark', 'light']).optional(), // MVP renders light only
    lengthUnit: z.enum(['meters', 'inches']).optional(),
    weeklyTrainingCount: z.coerce.number().int().min(1).max(14).nullable().optional(), // null clears the goal
  })
  .refine((v) => Object.keys(v).length > 0, { message: 'Provide at least one preference' })
```

## Use-cases (unit-tested in isolation)

Each depends on `UserPreferencesRepository` (interface) via the constructor and
is wired by a `make...` factory to the Prisma implementation.

- `CreateDefaultUserPreferencesUseCase` — create the row with default values for
  a given `userId` (called from registration; reject if one already exists).
- `GetUserPreferencesUseCase` — return the preferences for a `userId`.
- `UpdateUserPreferencesUseCase` — merge the partial update into the existing
  preferences and persist; throw `ResourceNotFoundError` if no row exists.

> The canonical defaults and the JSONB shape should live in one shared place
> (e.g. a `DEFAULT_PREFERENCES` const + a `UserPreferencesValue` type) reused by
> the use-cases, repository, and Zod schema.

## Repository

`UserPreferencesRepository` interface:

```typescript
export interface UserPreferencesRepository {
  create(data: Prisma.UserPreferencesUncheckedCreateInput): Promise<UserPreferences>
  findByUserId(userId: string): Promise<UserPreferences | null>
  save(preferences: UserPreferences): Promise<UserPreferences>
}
```

Implementations: `in-memory/in-memory-user-preferences-repository.ts` (unit
tests) and `prisma/prisma-user-preferences-repository.ts` (runtime).

## Business Rules

- Exactly one `user_preferences` row per user (`user_id` is unique).
- The row is created automatically at registration; the auth module's
  `RegisterUseCase` (or its controller) invokes
  `CreateDefaultUserPreferencesUseCase`.
- Updates are **partial merges** — unspecified keys retain their stored value.
- Only valid values are ever written (enums for units/theme, integer `1`–`14` or
  `null` for `weeklyTrainingCount`); invalid input is rejected at the edge.
- **Progress bar:** `weeklyTrainingCount` is the *goal* only and may be `null`
  (no goal). When set, the bar = `min(completed / goal, 1)`; when `null`, the UI
  shows the weekly count without a target. The *completed* count is **computed**
  from the user's trainments (Mon–Sun) by the trainment module — see
  `GET /trainments/weekly-progress` in [`01`](./01_TRAINMENT_MODULE.md); this
  module only owns the goal.

## Error cases

| Error                   | HTTP | When                                       |
|-------------------------|------|--------------------------------------------|
| `ResourceNotFoundError` | 404  | Preferences row not found for the user.    |
| `ZodError`              | 400  | Body fails enum/shape validation.          |

Map these in the controller (try/catch) and/or `app.setErrorHandler`.

## Testing expectations

**Unit tests** (in-memory repo, required for every use-case):

- Create default: creates a row with the documented defaults (`theme: light`,
  `weeklyTrainingCount: null`); rejects a second creation for the same user.
- Get: returns the stored preferences; behaves as specified when none exist.
- Update: merges a single key without altering the others; replaces multiple
  keys; throws `ResourceNotFoundError` when no row exists.
- Update goal: accepts `weeklyTrainingCount` within `1`–`14` and `null` (clears
  the goal); rejects `0`, `15`, and non-integers (`ZodError`).

**E2E tests** (real `app` + supertest + isolated Postgres schema — required
because new controllers are added):

- `GET /preferences` with a valid Bearer token → `200` with the defaults right
  after registration.
- `PATCH /preferences` with `{ "weightUnit": "lb" }` → `200`, and a subsequent
  `GET` reflects `weightUnit: lb` while `theme`/`lengthUnit` are unchanged.
- `PATCH /preferences` with an invalid value (e.g. `{ "weightUnit": "stone" }`)
  → `400`.

## Out of scope / open questions

- **GET when no row exists:** return defaults vs. `404`. Recommendation: since
  the row is created at registration, treat a missing row as `404`
  (`ResourceNotFoundError`); revisit if pre-existing users need lazy creation.
- Adding new preference keys later should be backward-compatible (JSONB) — when
  reading, fill any missing key from `DEFAULT_PREFERENCES`.
- No per-key history/auditing is required.
- **`weeklyTrainingCount` placement:** kept inside the `preferences` JSONB as a
  user goal. If progress reporting later needs to query/aggregate it (e.g.
  weekly summaries across users), consider promoting it to a dedicated column.
- **Completed-this-week count is derived, not stored here.** Where the progress
  bar is assembled (likely an analytics/trainment endpoint joining the goal with
  the week's trainments) is decided in the trainment module, not this spec.
- **Week boundary** (Mon-start vs. Sun-start, and timezone) for "this week" is a
  trainment-module decision; the goal value itself is timezone-agnostic.
