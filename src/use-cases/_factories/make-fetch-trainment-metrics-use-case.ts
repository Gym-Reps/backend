import { PrismaMetricsRepository } from '@/repositories/prisma/prisma-metrics-repository'
import { PrismaTrainmentsRepository } from '@/repositories/prisma/prisma-trainments-repository'
import { FetchTrainmentMetricsUseCase } from '../metrics/fetch-trainment-metrics/fetch-trainment-metrics'

export function makeFetchTrainmentMetricsUseCase() {
  const metricsRepository = new PrismaMetricsRepository()
  const trainmentsRepository = new PrismaTrainmentsRepository()

  return new FetchTrainmentMetricsUseCase(
    metricsRepository,
    trainmentsRepository,
  )
}
