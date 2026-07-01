import { randomUUID } from 'node:crypto'
import type { Event, Prisma } from '@prisma-client'
import type { EventsRepository } from '../events-repository'

export class InMemoryEventsRepository implements EventsRepository {
  public items: Event[] = []

  async create(data: Prisma.EventUncheckedCreateInput) {
    const now = new Date()
    const event: Event = {
      id: data.id ?? randomUUID(),
      event_type: data.event_type,
      status: data.status ?? 'PENDING',
      user_id: data.user_id,
      metadata: (data.metadata ?? {}) as unknown as Event['metadata'],
      attempts: data.attempts ?? 0,
      last_error: data.last_error ?? null,
      created_at: now,
      updated_at: now,
      processed_at: null,
    }
    this.items.push(event)
    return event
  }

  async findById(id: string) {
    return this.items.find((event) => event.id === id) ?? null
  }

  async markProcessing(id: string) {
    const event = this.items.find((item) => item.id === id)
    if (!event) return
    event.status = 'PROCESSING'
    event.updated_at = new Date()
  }

  async markCompleted(id: string) {
    const event = this.items.find((item) => item.id === id)
    if (!event) return
    event.status = 'COMPLETED'
    event.processed_at = new Date()
    event.updated_at = new Date()
  }

  async markFailed(id: string, attempts: number, error: string) {
    const event = this.items.find((item) => item.id === id)
    if (!event) return
    event.status = 'FAILED'
    event.attempts = attempts
    event.last_error = error
    event.processed_at = new Date()
    event.updated_at = new Date()
  }

  async findStalePending(olderThan: Date) {
    return this.items.filter(
      (event) =>
        event.status === 'PENDING' && event.created_at <= olderThan,
    )
  }
}
