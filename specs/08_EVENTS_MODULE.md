# Events (async queue — BullMQ + Redis)

## Overview

A **durable, asynchronous** mechanism so expensive work (like
[metrics](./09_METRICS_MODULE.md) computation, which runs per set) happens
**after** the request returns. Tolerant of seconds/minutes of delay by design.

**Chosen stack: [BullMQ](https://docs.bullmq.io/) on Redis**, paired with a
durable **`events` table** in Postgres:

- **BullMQ (Redis)** is the queue — it handles delivery, **retries with backoff**,
  concurrency, and scheduling, so we write almost no queue plumbing.
- **`events` table** is the **system of record / audit log**: every event is
  persisted with its status, attempts, and last error. It also acts as an
  **outbox backstop** — a sweeper re-enqueues any event that never got its job,
  giving at-least-once delivery even if Redis was briefly unavailable.

Why both: BullMQ alone keeps job state in Redis (ephemeral); the `events` table
gives you a queryable, durable history and recovery path. Why not Kafka/RabbitMQ:
overkill for a single-consumer, low-volume, delay-tolerant workload.

Architecture: layered SOLID. The consumer is a **BullMQ `Worker`** (a background
process), not a Fastify route.

## Infrastructure

- Add **Redis** to `docker-compose.yaml`:

  ```yaml
  reps-backend-redis:
    image: bitnami/redis
    environment:
      - ALLOW_EMPTY_PASSWORD=yes
    ports:
      - 6379:6379
  ```

- `REDIS_URL` (e.g. `redis://localhost:6379`) added to the validated env
  (`src/env`). One shared `ioredis` connection for the queue + worker.

## Entity: `events`

Table `events` — the durable record (BullMQ job state lives in Redis and mirrors
into this row).

| Field        | Type            | Notes                                                        |
|--------------|-----------------|-------------------------------------------------------------|
| `id`         | `string` (uuid) | Primary key. Used as the BullMQ `jobId` (dedupe + correlation). |
| `event_type` | `EventType`     | Enum, e.g. `COMPUTE_TRAINMENT_METRICS`. Maps to a BullMQ queue/handler. |
| `status`     | `EventStatus`   | `PENDING` → `PROCESSING` → `COMPLETED` \| `FAILED`.        |
| `user_id`    | `string` (uuid) | FK → `users.id`. Top-level (indexed), not buried in metadata. |
| `metadata`   | `JSONB`         | Handler payload, e.g. `{ "trainmentId": "..." }`.          |
| `attempts`   | `int`           | Mirrors BullMQ attempt count. Default `0`.                  |
| `last_error` | `string \| null`| Last failure message (from a failed BullMQ attempt).        |
| `created_at` | `DateTime`      | Default `now()`.                                            |
| `updated_at` | `DateTime`      | Auto-updated on each transition.                            |
| `processed_at`| `DateTime \| null`| When it reached a terminal state.                       |

```prisma
enum EventType {
  COMPUTE_TRAINMENT_METRICS
}

enum EventStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
}

model Event {
  id           String      @id @default(uuid())
  event_type   EventType
  status       EventStatus @default(PENDING)
  user         User        @relation(fields: [user_id], references: [id])
  user_id      String
  metadata     Json        @default("{}")
  attempts     Int         @default(0)
  last_error   String?
  created_at   DateTime    @default(now())
  updated_at   DateTime    @updatedAt
  processed_at DateTime?

  @@index([status, created_at]) // sweeper lookup for stuck PENDING rows
  @@map("events")
}
```

`User` needs a back-relation `events Event[]`.

## Producing events (outbox + enqueue)

A producer does two things; the DB write is the durable anchor:

1. **Insert the `events` row** (`status = PENDING`) **inside the same DB
   transaction** as the triggering change (so a finished/synced trainment and its
   event commit together — never one without the other).
2. **After commit, add a BullMQ job** carrying `jobId = event.id` and
   `{ eventId }` (or the metadata). Using the event id as `jobId` makes
   re-enqueues idempotent.

Producers:
- **Finish a trainment** ([`01`](./01_TRAINMENT_MODULE.md)) → `COMPUTE_TRAINMENT_METRICS { trainmentId }`.
- **Sync a trainment** ([`07`](./07_OFFLINE_SYNC_MODULE.md)) → same, with the row written **inside the sync transaction**.

```typescript
// EnqueueEventUseCase (within/after the producer's transaction)
const event = await eventsRepository.create({
  event_type: 'COMPUTE_TRAINMENT_METRICS', user_id: userId, metadata: { trainmentId },
})
await metricsQueue.add('COMPUTE_TRAINMENT_METRICS', { eventId: event.id },
  { jobId: event.id, attempts: 5, backoff: { type: 'exponential', delay: 2000 } })
```

**Outbox backstop (sweeper):** a periodic job re-adds BullMQ jobs for any
`PENDING` event older than ~1 min with no active job (covers a crash between
commit and enqueue, or a Redis blip). Because `jobId = event.id`, a duplicate add
is ignored.

## Consumer (BullMQ Worker)

A BullMQ `Worker` (started in `server.ts` after `app.listen`, or as a separate
`npm run worker` process). Per job:

1. Load the event by `eventId`; mark `status = PROCESSING`.
2. **Dispatch** by `event_type` to a registered handler use-case (e.g.
   `COMPUTE_TRAINMENT_METRICS → ComputeTrainmentMetricsUseCase`).
3. On success → `COMPLETED` (+ `processed_at`). On throw → BullMQ retries with
   backoff (mirror `attempts`/`last_error`); when attempts are exhausted, the
   `failed` event handler marks the row `FAILED`.

BullMQ gives retries/backoff/concurrency for free; multiple workers are safe.

> **Handlers must be idempotent** — a job can run twice (retry after a crash
> mid-work). The metrics handler upserts by `current_set_id`, so re-runs are
> harmless (see `09`).

## Use-cases

- `EnqueueEventUseCase` — persist the `events` row and add the BullMQ job.
- `ProcessEventUseCase` — the worker's body: load event → mark PROCESSING →
  dispatch to the handler (via an `event_type → use-case` registry) → settle
  status. Exposed directly so **tests can run it synchronously** without Redis.

## Repository

```typescript
export interface EventsRepository {
  create(data: Prisma.EventUncheckedCreateInput): Promise<Event>
  findById(id: string): Promise<Event | null>
  markProcessing(id: string): Promise<void>
  markCompleted(id: string): Promise<void>
  markFailed(id: string, attempts: number, error: string): Promise<void>
  findStalePending(olderThan: Date): Promise<Event[]> // sweeper
}
```

Implementations: `prisma/` (real) and `in-memory/` (unit tests). The BullMQ queue
+ worker wiring lives in `lib/queue.ts` (the transport), kept out of the
use-cases so they stay persistence/transport-agnostic.

## No public HTTP endpoints

Events are **internal infrastructure** — no member-facing routes. (An optional
`ADMIN` `GET /events?status=FAILED` for ops visibility is a post-MVP nicety.)

## Business Rules

- The `events` **row** is produced transactionally with its trigger (outbox); the
  BullMQ job is the delivery mechanism, backstopped by the sweeper → at-least-once.
- Handlers are **idempotent** and keyed so re-processing is harmless.
- BullMQ retries with exponential backoff up to `attempts`; exhausted → `FAILED`
  with `last_error`.
- Eventual consistency is acceptable: results (metrics) may lag by seconds/minutes.

## Testing expectations

**Unit tests** (in-memory `EventsRepository`; queue mocked):

- Enqueue: creates a `PENDING` event with the right `event_type`/`metadata` and
  adds a job with `jobId = event.id`.
- Process success: `ProcessEventUseCase` marks `PROCESSING` then `COMPLETED` and
  dispatches to the handler.
- Process failure: handler throws → `attempts` incremented, `last_error` set;
  terminal failure → `FAILED`.
- Idempotency: processing the same event twice runs the (idempotent) handler
  without corrupting state.
- Sweeper: `findStalePending` returns old `PENDING` rows for re-enqueue.

**E2E** (real `app` + DB, **no Redis needed**): producers enqueue on finish/sync
(assert the `events` row exists `PENDING`); a test helper invokes
`ProcessEventUseCase` directly to drain, so `09`'s e2e can assert metrics appear.
The live BullMQ worker is exercised in a separate integration check, not over HTTP.

## Out of scope / open questions

- **Worker deployment:** in-process (simplest for MVP) vs. a separate
  `npm run worker` process (better isolation/scaling). BullMQ supports both.
  Recommendation: in-process for MVP behind a flag.
- **Redis availability:** if Redis is down, enqueue fails but the `events` row is
  already committed `PENDING`; the sweeper re-enqueues when Redis returns. Confirm
  the sweeper interval (≈30–60s).
- **Concurrency / rate:** BullMQ `Worker` concurrency is low for MVP (e.g. 1–5).
- **Archival:** completed BullMQ jobs auto-remove (`removeOnComplete`); pruning
  old `COMPLETED` `events` rows is a later concern.
- **Bull Board** (`/admin/queues` dashboard) is a nice ops add-on, post-MVP.
