import { randomUUID } from 'node:crypto'
import type { Metric, Prisma } from '@prisma-client'
import type { MetricsRepository } from '../metrics-repository'

export class InMemoryMetricsRepository implements MetricsRepository {
  public items: Metric[] = []

  async upsertByCurrentSetId(data: Prisma.MetricUncheckedCreateInput) {
    const existing = this.items.find(
      (item) => item.current_set_id === data.current_set_id,
    )

    if (existing) {
      existing.user_id = data.user_id
      existing.trainment_id = data.trainment_id
      existing.exercise_id = data.exercise_id
      existing.previous_set_id = data.previous_set_id
      existing.weight_diff = data.weight_diff
      existing.repetitions_diff = data.repetitions_diff
      return existing
    }

    const metric: Metric = {
      id: data.id ?? randomUUID(),
      user_id: data.user_id,
      trainment_id: data.trainment_id,
      exercise_id: data.exercise_id,
      previous_set_id: data.previous_set_id,
      current_set_id: data.current_set_id,
      weight_diff: data.weight_diff,
      repetitions_diff: data.repetitions_diff,
      created_at: data.created_at ? new Date(data.created_at) : new Date(),
    }

    this.items.push(metric)

    return metric
  }

  async findManyByTrainmentId(trainmentId: string) {
    return this.items.filter((item) => item.trainment_id === trainmentId)
  }

  async findManyByExerciseId(exerciseId: string) {
    return this.items.filter((item) => item.exercise_id === exerciseId)
  }
}
