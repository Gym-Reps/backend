import { PrismaExercisesRepository } from '@/repositories/prisma/prisma-exercises-repository'
import { PrismaMetricsRepository } from '@/repositories/prisma/prisma-metrics-repository'
import { PrismaSetsRepository } from '@/repositories/prisma/prisma-sets-repository'
import { PrismaTrainmentsRepository } from '@/repositories/prisma/prisma-trainments-repository'
import { ComputeTrainmentMetricsUseCase } from '../metrics/compute-trainment-metrics/compute-trainment-metrics'

export function makeComputeTrainmentMetricsUseCase() {
  const trainmentsRepository = new PrismaTrainmentsRepository()
  const exercisesRepository = new PrismaExercisesRepository()
  const setsRepository = new PrismaSetsRepository()
  const metricsRepository = new PrismaMetricsRepository()

  return new ComputeTrainmentMetricsUseCase(
    trainmentsRepository,
    exercisesRepository,
    setsRepository,
    metricsRepository,
  )
}
