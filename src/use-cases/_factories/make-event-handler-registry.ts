import type { EventHandlerRegistry } from '../events/_handlers/event-handler'

/**
 * The `event_type → handler` map the worker dispatches through. The metrics
 * handler is a no-op placeholder until 09_METRICS_MODULE lands and registers the
 * real `ComputeTrainmentMetricsUseCase` here — keeping it registered means a
 * synced/finished trainment's event drains to COMPLETED today instead of dead-
 * lettering on a missing handler.
 */
export function makeEventHandlerRegistry(): EventHandlerRegistry {
  return {
    // TODO(09_METRICS_MODULE): replace with makeComputeTrainmentMetricsUseCase().
    COMPUTE_TRAINMENT_METRICS: {
      async handle() {
        // no-op until the metrics module registers the real handler
      },
    },
  }
}
