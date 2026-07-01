import { PrismaEventsRepository } from '@/repositories/prisma/prisma-events-repository'
import { makeProcessEventUseCase } from '@/use-cases/_factories/make-process-event-use-case'

/**
 * Drains the `events` outbox synchronously — no Redis/BullMQ in tests. Runs every
 * currently-PENDING event through the real `ProcessEventUseCase` (same body the
 * worker uses), so downstream effects (e.g. metrics rows) are materialized before
 * the assertions. Handlers are idempotent, so draining more than once is safe.
 */
export async function drainEvents() {
  const eventsRepository = new PrismaEventsRepository()
  const processEvent = makeProcessEventUseCase()

  const pending = await eventsRepository.findStalePending(new Date())

  for (const event of pending) {
    await processEvent.execute({ eventId: event.id })
  }
}
