import type { Event, EventType } from '@prisma-client'

/**
 * A unit of async work bound to an `event_type`. Handlers MUST be idempotent —
 * a job can run more than once (retry after a crash, sweeper re-enqueue) — so
 * they key their writes on a natural id (e.g. metrics upsert by current_set_id).
 */
export interface EventHandler {
  handle(event: Event): Promise<void>
}

/** `event_type → handler` lookup used by `ProcessEventUseCase` to dispatch. */
export type EventHandlerRegistry = Partial<Record<EventType, EventHandler>>
