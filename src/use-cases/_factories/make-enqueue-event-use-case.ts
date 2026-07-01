import { PrismaEventsRepository } from '@/repositories/prisma/prisma-events-repository'
import { BullMqEventQueue } from '@/queues/bullmq-event-queue'
import { EnqueueEventUseCase } from '../events/enqueue-event/enqueue-event'

export function makeEnqueueEventUseCase() {
  const eventsRepository = new PrismaEventsRepository()
  const eventQueue = new BullMqEventQueue()

  return new EnqueueEventUseCase(eventsRepository, eventQueue)
}
