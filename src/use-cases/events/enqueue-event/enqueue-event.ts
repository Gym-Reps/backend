import type { Event, EventType, Prisma } from '@prisma-client'
import type { EventsRepository } from '@/repositories/events-repository'
import type { EventQueue } from '@/queues/event-queue'

interface EnqueueEventUseCaseRequest {
  eventType: EventType
  userId: string
  metadata: Record<string, unknown>
}

interface EnqueueEventUseCaseResponse {
  event: Event
}

/**
 * The outbox producer (08_EVENTS_MODULE): persist a durable `events` row
 * (PENDING) — the system of record — then add the BullMQ job. The row is the
 * anchor, so the queue add is best-effort: if Redis is unavailable the row is
 * still committed PENDING and the sweeper re-enqueues it later (at-least-once).
 */
export class EnqueueEventUseCase {
  constructor(
    private eventsRepository: EventsRepository,
    private eventQueue: EventQueue,
  ) {}

  async execute({
    eventType,
    userId,
    metadata,
  }: EnqueueEventUseCaseRequest): Promise<EnqueueEventUseCaseResponse> {
    const event = await this.eventsRepository.create({
      event_type: eventType,
      user_id: userId,
      metadata: metadata as Prisma.InputJsonValue,
    })

    try {
      await this.eventQueue.add({ eventId: event.id, eventType, metadata })
    } catch (err) {
      // Row is durable; the sweeper backstops delivery. Never fail the request.
      console.error('[events] failed to enqueue job, sweeper will retry', err)
    }

    return { event }
  }
}
