import { beforeEach, describe, expect, it, vi } from 'vitest'
import { InMemoryEventsRepository } from '@/repositories/in-memory/in-memory-events-repository'
import { InMemoryEventQueue } from '@/queues/in-memory/in-memory-event-queue'
import { EnqueueEventUseCase } from './enqueue-event'

let eventsRepository: InMemoryEventsRepository
let eventQueue: InMemoryEventQueue
let sut: EnqueueEventUseCase

describe('Enqueue Event Use Case', () => {
  beforeEach(() => {
    eventsRepository = new InMemoryEventsRepository()
    eventQueue = new InMemoryEventQueue()
    sut = new EnqueueEventUseCase(eventsRepository, eventQueue)
  })

  it('creates a PENDING event with the given type/metadata and enqueues a job keyed by the event id', async () => {
    const { event } = await sut.execute({
      eventType: 'COMPUTE_TRAINMENT_METRICS',
      userId: 'user-1',
      metadata: { trainmentId: 'trainment-1' },
    })

    expect(event.status).toBe('PENDING')
    expect(event.event_type).toBe('COMPUTE_TRAINMENT_METRICS')
    expect(event.user_id).toBe('user-1')
    expect(event.metadata).toEqual({ trainmentId: 'trainment-1' })
    expect(eventsRepository.items).toHaveLength(1)

    // job carries jobId = event.id (the abstraction records eventId)
    expect(eventQueue.jobs).toHaveLength(1)
    expect(eventQueue.jobs[0]?.eventId).toBe(event.id)
    expect(eventQueue.jobs[0]?.eventType).toBe('COMPUTE_TRAINMENT_METRICS')
  })

  it('still commits the durable row when the queue add fails (sweeper backstop)', async () => {
    vi.spyOn(eventQueue, 'add').mockRejectedValueOnce(new Error('redis down'))

    const { event } = await sut.execute({
      eventType: 'COMPUTE_TRAINMENT_METRICS',
      userId: 'user-1',
      metadata: { trainmentId: 'trainment-1' },
    })

    // no throw; the PENDING row survives for the sweeper to re-enqueue
    expect(event.status).toBe('PENDING')
    expect(eventsRepository.items).toHaveLength(1)
  })
})
