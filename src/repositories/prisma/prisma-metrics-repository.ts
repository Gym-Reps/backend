import type { Prisma } from '@prisma-client'
import { prisma } from '@/lib/prisma'
import type { MetricsRepository } from '../metrics-repository'

export class PrismaMetricsRepository implements MetricsRepository {
  async upsertByCurrentSetId(data: Prisma.MetricUncheckedCreateInput) {
    return prisma.metric.upsert({
      where: { current_set_id: data.current_set_id },
      create: data,
      update: {
        user_id: data.user_id,
        trainment_id: data.trainment_id,
        exercise_id: data.exercise_id,
        previous_set_id: data.previous_set_id,
        weight_diff: data.weight_diff,
        repetitions_diff: data.repetitions_diff,
      },
    })
  }

  async findManyByTrainmentId(trainmentId: string) {
    return prisma.metric.findMany({ where: { trainment_id: trainmentId } })
  }

  async findManyByExerciseId(exerciseId: string) {
    return prisma.metric.findMany({ where: { exercise_id: exerciseId } })
  }
}
