# Async jobs (BullMQ + Redis + events outbox)

For work that must happen **after** the request returns — heavy computation,
fan-out, anything the user can wait seconds/minutes for (e.g. metrics). The queue
is **BullMQ on Redis**, paired with a durable **`events` table** (the system of
record + outbox backstop). See `specs/08_EVENTS_MODULE.md`.

## When to use this

Reach for the queue when a spec says "asynchronously", "after the trainment",
"don't block the request", "eventually", or describes per-row work triggered by a
single action. CRUD stays synchronous — don't queue what's cheap.

## Layering — the queue is *transport*, like Prisma

Keep BullMQ/Redis out of use-cases, exactly like Prisma:

- **`src/lib/queue.ts`** — the `ioredis` connection + BullMQ `Queue`/`Worker`
  wiring. The only place that imports `bullmq`.
- **`EventsRepository`** (interface) + `in-memory`/`prisma` impls — the durable
  `events` row.
- **Producer use-case** (`EnqueueEventUseCase`) — persists the `events` row and
  adds the BullMQ job. Pure; depends on the interface + a queue port.
- **Handler use-cases** (e.g. `ComputeTrainmentMetricsUseCase`) — plain
  use-cases the worker calls. They never import BullMQ. **Idempotent** (a job can
  run twice) — upsert by a natural key.
- **`ProcessEventUseCase`** — loads the event, marks `PROCESSING`, dispatches by
  `event_type` to the handler registry, settles `COMPLETED`/`FAILED`. The worker
  is a thin shell over this; tests call it directly.

```
controller / sync ──► EnqueueEventUseCase ──► events row (PENDING)  +  BullMQ job
                                                                          │
                            lib/queue.ts  Worker ──► ProcessEventUseCase ─┤
                                                          │ dispatch by event_type
                                                          ▼
                                                  Handler use-case (idempotent)
```

## Outbox pattern (durability)

1. Insert the `events` row (`PENDING`) **in the same DB transaction** as the
   triggering write (e.g. inside the sync transaction), so you never commit the
   work without the event.
2. **After commit**, add the BullMQ job with `jobId = event.id` (id as jobId makes
   re-enqueues idempotent).
3. A **sweeper** (periodic) re-adds jobs for `PENDING` events older than ~1 min
   with no active job — covers a crash between commit and enqueue, or a Redis
   blip. Gives at-least-once delivery.

## Infrastructure

`docker-compose.yaml`:

```yaml
reps-backend-redis:
  image: bitnami/redis
  environment:
    - ALLOW_EMPTY_PASSWORD=yes
  ports:
    - 6379:6379
```

Add `REDIS_URL` to the validated env (`src/env`). Deps: `bullmq` + `ioredis`.

```typescript
// src/lib/queue.ts
import { Queue, Worker } from 'bullmq'
import IORedis from 'ioredis'
import { env } from '@/env'

export const connection = new IORedis(env.REDIS_URL, { maxRetriesPerRequest: null })

export const metricsQueue = new Queue('metrics', { connection })

// enqueue (from EnqueueEventUseCase, after commit)
await metricsQueue.add(
  'COMPUTE_TRAINMENT_METRICS',
  { eventId },
  { jobId: eventId, attempts: 5, backoff: { type: 'exponential', delay: 2000 } },
)
```

## The worker

A BullMQ `Worker` started after `app.listen` in `server.ts` (in-process for MVP)
or as a separate `npm run worker` process. Keep it thin — delegate to
`ProcessEventUseCase`:

```typescript
// src/worker.ts (or inside server bootstrap)
new Worker(
  'metrics',
  async (job) => {
    await makeProcessEventUseCase().execute({ eventId: job.data.eventId })
  },
  { connection, concurrency: 5 },
)
```

Add a script: `"worker": "tsx src/worker.ts"` (and start it alongside `dev`).

## Testing async work — no Redis in tests

Don't boot Redis/BullMQ in unit or e2e tests. Test the **use-cases** directly:

- **Unit** (in-memory `EventsRepository`, queue mocked):
  - `EnqueueEventUseCase` creates a `PENDING` row (and calls the queue port).
  - `ProcessEventUseCase` → `PROCESSING` → dispatch → `COMPLETED`; on handler
    throw → `attempts++`, `last_error`, eventually `FAILED`.
  - Handler idempotency: run it twice → no duplicate effects.
- **E2E** (real `app` + DB, **no Redis**): trigger the producer (finish/sync),
  assert the `events` row is `PENDING`, then **drain synchronously** with a helper
  that calls `ProcessEventUseCase` for each pending event, and assert the
  downstream result (e.g. metrics rows) appears.

```typescript
// test helper: drain the outbox without Redis
export async function drainEvents() {
  for (const e of await eventsRepository.findStalePending(new Date())) {
    await makeProcessEventUseCase().execute({ eventId: e.id })
  }
}
```

## Checklist for an async feature

- [ ] `events` row written in the producer's DB transaction (outbox).
- [ ] BullMQ job added after commit with `jobId = event.id`.
- [ ] Handler use-case is idempotent (upsert by natural key).
- [ ] No `bullmq`/`ioredis` import outside `lib/queue.ts` / `worker`.
- [ ] Redis in `docker-compose`, `REDIS_URL` in `src/env`.
- [ ] Unit tests for enqueue + process (success/failure/idempotency); e2e drains
      synchronously without Redis.
