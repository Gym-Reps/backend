import type { EventType } from '@prisma-client'

/**
 * A job asking the worker to process a durable `events` row. `eventId` doubles as
 * the BullMQ `jobId`, which is what makes re-enqueues (sweeper, retries)
 * idempotent — Redis ignores a duplicate add for a job that already exists.
 */
export interface EnqueueEventJob {
  eventId: string
  eventType: EventType
  metadata?: Record<string, unknown>
}

/**
 * Transport port for the async queue, kept abstract so producers/use-cases never
 * import BullMQ (mirrors how Prisma stays behind repository interfaces). The real
 * BullMQ implementation lives in `queues/bullmq-event-queue.ts`; tests use the
 * in-memory fake.
 */
export interface EventQueue {
  add(job: EnqueueEventJob): Promise<void>
}
