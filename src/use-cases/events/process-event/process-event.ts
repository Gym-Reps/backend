import type { Event } from '@prisma-client'
import type { EventsRepository } from '@/repositories/events-repository'
import { ResourceNotFoundError } from '../../errors/resource-not-found-error'
import type { EventHandlerRegistry } from '../_handlers/event-handler'

interface ProcessEventUseCaseRequest {
  eventId: string
  /** BullMQ attempt count for this run (1-based). Defaults to a single attempt. */
  attemptsMade?: number
  /** Max attempts BullMQ will make before the failure is terminal. */
  maxAttempts?: number
}

interface ProcessEventUseCaseResponse {
  event: Event
}

/**
 * The worker's body (08_EVENTS_MODULE), exposed directly so tests drain the
 * outbox without Redis. Loads the event, marks PROCESSING, dispatches by
 * `event_type` to a registered (idempotent) handler, then settles COMPLETED. On
 * a handler throw it mirrors `attempts`/`last_error`; when attempts are
 * exhausted it settles FAILED. The error is re-thrown so BullMQ can retry.
 */
export class ProcessEventUseCase {
  constructor(
    private eventsRepository: EventsRepository,
    private handlers: EventHandlerRegistry,
  ) {}

  async execute({
    eventId,
    attemptsMade = 1,
    maxAttempts = 1,
  }: ProcessEventUseCaseRequest): Promise<ProcessEventUseCaseResponse> {
    const event = await this.eventsRepository.findById(eventId)

    if (!event) {
      throw new ResourceNotFoundError()
    }

    const handler = this.handlers[event.event_type]

    if (!handler) {
      throw new Error(
        `No handler registered for event type ${event.event_type}`,
      )
    }

    await this.eventsRepository.markProcessing(event.id)

    try {
      // Handlers are idempotent, so re-processing a COMPLETED event is harmless.
      await handler.handle(event)
      await this.eventsRepository.markCompleted(event.id)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      const isTerminal = attemptsMade >= maxAttempts

      if (isTerminal) {
        await this.eventsRepository.markFailed(event.id, attemptsMade, message)
      }

      // Re-throw so the transport (BullMQ) retries with backoff until exhausted.
      throw err
    }

    return { event }
  }
}
