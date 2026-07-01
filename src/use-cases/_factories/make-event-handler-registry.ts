import type { EventHandlerRegistry } from '../events/_handlers/event-handler'
import { makeComputeTrainmentMetricsUseCase } from './make-compute-trainment-metrics-use-case'

/**
 * The `event_type → handler` map the worker dispatches through. Handlers are
 * idempotent use-cases, so a job that runs more than once (retry, sweeper) is
 * harmless.
 */
export function makeEventHandlerRegistry(): EventHandlerRegistry {
  return {
    COMPUTE_TRAINMENT_METRICS: makeComputeTrainmentMetricsUseCase(),
  }
}
