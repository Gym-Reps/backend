import type { Event } from '@prisma-client'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { InMemoryEventsRepository } from '@/repositories/in-memory/in-memory-events-repository'
import { ResourceNotFoundError } from '../../errors/resource-not-found-error'
import type { EventHandler } from '../_handlers/event-handler'
import { ProcessEventUseCase } from './process-event'

let eventsRepository: InMemoryEventsRepository
let handler: EventHandler & { calls: number }
let sut: ProcessEventUseCase

function makeSpyHandler(impl?: () => Promise<void>): EventHandler & {
  calls: number
} {
  return {
    calls: 0,
    async handle() {
      this.calls += 1
      if (impl) await impl()
    },
  }
}

async function seedPendingEvent() {
  return eventsRepository.create({
    event_type: 'COMPUTE_TRAINMENT_METRICS',
    user_id: 'user-1',
    metadata: { trainmentId: 'trainment-1' },
  })
}

describe('Process Event Use Case', () => {
  beforeEach(() => {
    eventsRepository = new InMemoryEventsRepository()
    handler = makeSpyHandler()
    sut = new ProcessEventUseCase(eventsRepository, {
      COMPUTE_TRAINMENT_METRICS: handler,
    })
  })

  it('marks PROCESSING then COMPLETED and dispatches to the handler', async () => {
    const markProcessing = vi.spyOn(eventsRepository, 'markProcessing')
    const event = await seedPendingEvent()

    await sut.execute({ eventId: event.id })

    expect(handler.calls).toBe(1)
    expect(markProcessing).toHaveBeenCalledWith(event.id)
    const stored = await eventsRepository.findById(event.id)
    expect(stored?.status).toBe('COMPLETED')
    expect(stored?.processed_at).toEqual(expect.any(Date))
  })

  it('throws ResourceNotFoundError for an unknown event id', async () => {
    await expect(
      sut.execute({ eventId: 'does-not-exist' }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('throws when no handler is registered for the event type', async () => {
    sut = new ProcessEventUseCase(eventsRepository, {})
    const event = await seedPendingEvent()

    await expect(sut.execute({ eventId: event.id })).rejects.toThrow(
      /No handler registered/,
    )
  })

  it('on terminal handler failure: marks FAILED with attempts + last_error and re-throws', async () => {
    handler = makeSpyHandler(async () => {
      throw new Error('boom')
    })
    sut = new ProcessEventUseCase(eventsRepository, {
      COMPUTE_TRAINMENT_METRICS: handler,
    })
    const event = await seedPendingEvent()

    await expect(
      sut.execute({ eventId: event.id, attemptsMade: 5, maxAttempts: 5 }),
    ).rejects.toThrow('boom')

    const stored = await eventsRepository.findById(event.id)
    expect(stored?.status).toBe('FAILED')
    expect(stored?.attempts).toBe(5)
    expect(stored?.last_error).toBe('boom')
  })

  it('on a non-terminal failure: re-throws for retry and leaves the row non-terminal', async () => {
    handler = makeSpyHandler(async () => {
      throw new Error('transient')
    })
    sut = new ProcessEventUseCase(eventsRepository, {
      COMPUTE_TRAINMENT_METRICS: handler,
    })
    const event = await seedPendingEvent()

    await expect(
      sut.execute({ eventId: event.id, attemptsMade: 1, maxAttempts: 5 }),
    ).rejects.toThrow('transient')

    const stored = await eventsRepository.findById(event.id)
    // not FAILED yet — BullMQ still has retries left
    expect(stored?.status).toBe('PROCESSING')
  })

  it('is idempotent: processing twice runs the (idempotent) handler and stays COMPLETED', async () => {
    const event = await seedPendingEvent()

    await sut.execute({ eventId: event.id })
    await sut.execute({ eventId: event.id })

    expect(handler.calls).toBe(2)
    const stored = await eventsRepository.findById(event.id)
    expect(stored?.status).toBe('COMPLETED')
  })

  it('sweeper: findStalePending returns old PENDING rows for re-enqueue', async () => {
    const event = await seedPendingEvent()
    // backdate the row so it looks stuck
    const stored = await eventsRepository.findById(event.id)
    if (stored) stored.created_at = new Date('2000-01-01T00:00:00Z')

    const stale = await eventsRepository.findStalePending(new Date())
    expect(stale.map((e) => e.id)).toContain(event.id)
  })
})
