import { PrismaExercisesRepository } from '@/repositories/prisma/prisma-exercises-repository'
import { PrismaMetricsRepository } from '@/repositories/prisma/prisma-metrics-repository'
import { PrismaTrainmentsRepository } from '@/repositories/prisma/prisma-trainments-repository'
import { FetchExerciseMetricsUseCase } from '../metrics/fetch-exercise-metrics/fetch-exercise-metrics'

export function makeFetchExerciseMetricsUseCase() {
  const metricsRepository = new PrismaMetricsRepository()
  const exercisesRepository = new PrismaExercisesRepository()
  const trainmentsRepository = new PrismaTrainmentsRepository()

  return new FetchExerciseMetricsUseCase(
    metricsRepository,
    exercisesRepository,
    trainmentsRepository,
  )
}
