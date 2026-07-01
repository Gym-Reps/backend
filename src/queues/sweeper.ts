import { PrismaEventsRepository } from '@/repositories/prisma/prisma-events-repository'
import { BullMqEventQueue } from './bullmq-event-queue'

/**
 * Outbox backstop (08_EVENTS_MODULE). Periodically re-enqueues any `events` row
 * still `PENDING` past `STALE_AFTER_MS` — covering a crash between the producer's
 * commit and its BullMQ `add`, or a transient Redis outage. Because the job's
 * `jobId` is the event id, a duplicate add for an in-flight job is ignored, so
 * re-enqueuing is safe (at-least-once delivery).
 */
const SWEEP_INTERVAL_MS = 30_000
const STALE_AFTER_MS = 60_000

export function startEventSweeper() {
  const eventsRepository = new PrismaEventsRepository()
  const queue = new BullMqEventQueue()

  async function sweep() {
    try {
      const cutoff = new Date(Date.now() - STALE_AFTER_MS)
      const stale = await eventsRepository.findStalePending(cutoff)

      for (const event of stale) {
        await queue.add({ eventId: event.id, eventType: event.event_type })
      }
    } catch (err) {
      console.error('[events] sweeper run failed', err)
    }
  }

  const timer = setInterval(sweep, SWEEP_INTERVAL_MS)
  // Don't keep the process alive solely for the sweeper tick.
  timer.unref()

  return timer
}
