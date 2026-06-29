# Specs

Source-of-truth specifications for `reps-backend`. Each spec describes one app,
feature, or flow in enough detail to be implemented end-to-end (schema →
repositories → use-cases → controllers → tests).

These files are the input for the `backend-engineer` skill: point it at a spec
and it implements the feature following SOLID / repository / factory patterns,
with a **unit test for every use-case** and an **e2e test for every new
controller**.

## Convention

- One file per **module**, numbered for ordering and named after the module in
  upper snake case: `NN_<MODULE>_MODULE.md` (e.g. `00_AUTH_MODULE.md`,
  `01_TRAINMENT_MODULE.md`).
- Keep the structure consistent (Overview → Entity → Functional Requirements →
  Endpoints → Use-cases → Business Rules → Security → Errors → Testing → Notes).
- When a spec changes the data model, call out the **delta** from the current
  `prisma/schema.prisma` explicitly.

## Index

| # | Module | Spec | Status |
|---|--------|------|--------|
| 00 | Auth | [00_AUTH_MODULE](./00_AUTH_MODULE.md) | Draft |
| 01 | Trainment | [01_TRAINMENT_MODULE](./01_TRAINMENT_MODULE.md) | Draft |
| 02 | User Preferences | [02_USER_PREFERENCES_MODULE](./02_USER_PREFERENCES_MODULE.md) | Draft |
| 03 | Exercise Catalog | [03_EXERCISE_CATALOG_MODULE](./03_EXERCISE_CATALOG_MODULE.md) | Draft |
| 04 | Improvements (Differentiators) | [04_IMPROVEMENTS_MODULE](./04_IMPROVEMENTS_MODULE.md) | Roadmap |
| 05 | Exercises (exercise_template + exercise) | [05_EXERCISES_MODULE](./05_EXERCISES_MODULE.md) | Draft |
| 06 | Sets | [06_SETS_MODULE](./06_SETS_MODULE.md) | Draft |
| 07 | Offline-First Trainment Sync | [07_OFFLINE_SYNC_MODULE](./07_OFFLINE_SYNC_MODULE.md) | Draft |
| 08 | Events (BullMQ + Redis) | [08_EVENTS_MODULE](./08_EVENTS_MODULE.md) | Draft |
| 09 | Metrics | [09_METRICS_MODULE](./09_METRICS_MODULE.md) | Draft |

## Build / migration order

Create tables in FK-dependency order (a parent must exist before anything that
references it). This is also a sensible implementation order:

1. **User** (`00`)
2. **DefaultExercise** / exercise catalog (`03`) — independent; needed before `exercise_template`
3. **UserPreferences** (`02`) → User
4. **TrainmentTemplate** (`01`) → User
5. **ExerciseTemplate** (`05`) → TrainmentTemplate, DefaultExercise
6. **Trainment** (`01`) → TrainmentTemplate, User
7. **Exercise** (`05`) → Trainment, ExerciseTemplate
8. **Set** (`06`) → Exercise, Trainment, User
9. **Event** (`08`) → User
10. **Metric** (`09`) → User, Trainment, Exercise, Set

> Not a separate step: Prisma requires the **parent-side relation field** on the
> "one" side of each FK. As you add modules, `User` accumulates
> `preferences`, `trainmentTemplates`, `trainments`, `sets`, `events`, `metrics`;
> `Set` gains the two named metric relations; `Trainment`/`Exercise` gain
> `metrics`; `DefaultExercise` gains `exerciseTemplates`. Keep one
> `prisma/schema.prisma` and add these as you go.
