import { PrismaEventsRepository } from '@/repositories/prisma/prisma-events-repository'
import { ProcessEventUseCase } from '../events/process-event/process-event'
import { makeEventHandlerRegistry } from './make-event-handler-registry'

export function makeProcessEventUseCase() {
  const eventsRepository = new PrismaEventsRepository()

  return new ProcessEventUseCase(eventsRepository, makeEventHandlerRegistry())
}
