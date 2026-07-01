import type { Metric, Prisma } from '@prisma-client'

/**
 * Derived per-set progress diffs (09_METRICS). Rows are written only by the async
 * `ComputeTrainmentMetricsUseCase`, keyed on the unique `current_set_id` so the
 * upsert makes re-processing an event harmless (idempotent).
 */
export interface MetricsRepository {
  // Upsert on the unique current_set_id — one metric per current set.
  upsertByCurrentSetId(
    data: Prisma.MetricUncheckedCreateInput,
  ): Promise<Metric>
  findManyByTrainmentId(trainmentId: string): Promise<Metric[]>
  findManyByExerciseId(exerciseId: string): Promise<Metric[]>
}
