import { env } from '@/env'
import { getMetricsQueue } from '@/lib/queue'
import type { EnqueueEventJob, EventQueue } from './event-queue'

/**
 * BullMQ-backed queue. Imports the transport from `lib/queue` (never `bullmq`
 * directly) so the "no BullMQ outside lib/queue" rule holds. Under `test` it is a
 * no-op: e2e drains the outbox synchronously via `ProcessEventUseCase`, so we
 * never require a running Redis in the test suite.
 */
export class BullMqEventQueue implements EventQueue {
  async add(job: EnqueueEventJob) {
    if (env.NODE_ENV === 'test') return

    await getMetricsQueue().add(
      job.eventType,
      { eventId: job.eventId },
      {
        jobId: job.eventId,
        attempts: 5,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: true,
      },
    )
  }
}
