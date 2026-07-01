import type { Metric } from '@prisma-client'

export function metricToHTTP(metric: Metric) {
  return {
    id: metric.id,
    trainmentId: metric.trainment_id,
    exerciseId: metric.exercise_id,
    previousSetId: metric.previous_set_id,
    currentSetId: metric.current_set_id,
    weightDiff: metric.weight_diff,
    repetitionsDiff: metric.repetitions_diff,
  }
}
