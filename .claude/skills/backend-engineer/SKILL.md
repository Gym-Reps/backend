---
name: backend-engineer
description: >-
  Implement a backend app, feature, or spec from a Markdown instruction file in
  this TypeScript + Fastify + Prisma + Docker project. Applies SOLID, DDD,
  the repository pattern, and the factory pattern. ALWAYS writes a unit test for
  every use-case/business-rule addition, and an e2e test whenever a new
  controller/route is introduced. Use when asked to "build", "implement",
  "scaffold", or "code" a feature/app/spec, or when pointed at a `.md` spec file.
---

# Backend Engineer

Turn a Markdown instruction file (a whole app, a single feature, or a spec) into
working, tested backend code following the conventions of the author's two
reference repos:

- **forum-backend** — DDD / Clean Architecture (rich domains, entities, Either).
- **gympass-similar-backend** — layered SOLID (Fastify controllers + use-cases +
  factories + repositories). This is the default style for this project
  (`reps-backend` already matches it: `src/http/controllers`, `src/lib/prisma`,
  Fastify + Zod + Prisma).

Stack: **TypeScript, Fastify, Prisma ORM, Zod, Vitest, Docker**, plus **BullMQ +
Redis** for asynchronous jobs. Path alias `@/*` → `./src/*`.

## Non-negotiable rules

1. **Every addition gets a unit test.** Each use-case / business rule is tested
   in isolation against an **in-memory repository** (never the DB). Name it
   `<feature>.spec.ts` next to the use-case.
2. **Every new controller gets an e2e test.** If you add a route/controller,
   add `<action>.e2e-spec.ts` (or `<action>.spec.ts` under `controllers/`) that
   boots the real `app`, hits it with `supertest`, and asserts the HTTP result.
3. **Depend on abstractions, not Prisma.** Use-cases receive a repository
   *interface* via the constructor (DIP). Prisma only appears in
   `repositories/prisma/*` and in factories.
4. **Factories wire the real implementations.** Controllers call
   `make<X>UseCase()` — they never `new` a Prisma repository directly.
5. **Validate input with Zod at the edge** (controller), keep use-cases pure.
6. **Don't break the test gates.** `npm test` (unit) and `npm run test:e2e`
   must pass for what you touched.

## Workflow

Track multi-step work with the task tools when the spec has several features.

1. **Read the spec.** Read the `.md` file given (or `planning/main.md` by
   default). Extract: entities, business rules, endpoints, auth needs,
   relationships. List the use-cases and controllers implied.
2. **Pick the architecture** (see decision below). Default = layered SOLID.
3. **Confirm scaffolding exists.** Check `package.json` scripts, `vite.config.ts`
   (unit/e2e projects), `prisma/vitest-environment-prisma`, test utils,
   `src/app.ts`. If missing, create them from
   `references/testing.md` before writing features. The current `reps-backend`
   is minimal — expect to add the test harness on first run.
4. **For each feature, build bottom-up:**
   1. Prisma schema model(s) → `prisma/schema.prisma`, then a migration.
   2. Repository **interface** (`src/repositories/<x>-repository.ts`).
   3. **In-memory** implementation (`repositories/in-memory/`).
   4. **Use-case** (`src/use-cases/<feature>/<feature>.ts`) depending on the
      interface.
   5. **Unit test** (`<feature>.spec.ts`) using the in-memory repo. Cover the
      happy path **and** each error branch.
   6. **Prisma** implementation (`repositories/prisma/`).
   7. **Factory** (`src/use-cases/_factories/make-<feature>-use-case.ts`).
   8. **Controller** (`src/http/controllers/<resource>/<action>/<action>.ts`)
      with Zod validation → factory → use-case.
   9. **Route** registration (`controllers/<resource>/routes.ts`, wired in
      `app.ts`).
   10. **E2E test** for the new controller.
5. **Async work?** If the spec calls for work after the response (heavy compute,
   per-row fan-out, "asynchronously/eventually"), use the **BullMQ + Redis**
   queue with the durable `events` outbox — see `references/async-jobs.md`. Keep
   BullMQ/Redis in `lib/queue.ts` only; handlers are idempotent use-cases.
6. **Run the gates.** Generate the Prisma client / run migrations as needed,
   then `npm test` and (if controllers changed) `npm run test:e2e`. Report
   results honestly; fix failures before claiming done.

## Choosing the architecture

| Use **layered SOLID** (gympass) | Use **DDD** (forum) |
|---|---|
| CRUD-ish features, thin business rules | Rich invariants, behavior-heavy aggregates |
| Prisma model ≈ domain model | Domain model diverges from persistence |
| The default for `reps-backend` | Multiple bounded contexts, domain events |

Don't mix styles within one bounded context. When unsure, ask the user only if
the spec is genuinely ambiguous about domain complexity; otherwise default to
layered SOLID and say so.

- Layered SOLID conventions + copy-ready templates → `references/layered-architecture.md`
- DDD building blocks (Entity, Either, value objects, events) → `references/ddd-architecture.md`
- Test harness, vitest config, unit + e2e patterns → `references/testing.md`
- Async jobs: BullMQ + Redis, events outbox, worker, draining in tests → `references/async-jobs.md`

## Definition of done (checklist)

- [ ] Prisma schema + migration applied for new models.
- [ ] Repository interface + in-memory + prisma implementations.
- [ ] Use-case depends on the interface; wired through a factory.
- [ ] Unit test covers happy path + every error branch (in-memory repo).
- [ ] New controller has Zod validation and an e2e test.
- [ ] Routes registered in `app.ts`.
- [ ] `npm test` green; `npm run test:e2e` green if controllers changed.
- [ ] No Prisma import outside `repositories/prisma/*` or `_factories/*`.
- [ ] Async work (if any): `events` row written in the producer's transaction,
      job enqueued after commit, idempotent handler, no `bullmq`/`ioredis` import
      outside `lib/queue.ts`/`worker`, Redis in `docker-compose` + `REDIS_URL` in
      `src/env`.
