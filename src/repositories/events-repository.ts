import type { Event, Prisma } from '@prisma-client'

/**
 * The durable `events` outbox (08_EVENTS_MODULE): the system of record for async
 * work. A row is written transactionally with its trigger (finish/sync) and its
 * lifecycle is driven by the worker: PENDING → PROCESSING → COMPLETED | FAILED.
 */
export interface EventsRepository {
  create(data: Prisma.EventUncheckedCreateInput): Promise<Event>
  findById(id: string): Promise<Event | null>
  markProcessing(id: string): Promise<void>
  markCompleted(id: string): Promise<void>
  markFailed(id: string, attempts: number, error: string): Promise<void>
  /** Stuck-PENDING rows older than `olderThan` — the sweeper re-enqueues these. */
  findStalePending(olderThan: Date): Promise<Event[]>
}
