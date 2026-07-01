import type { Metric } from '@prisma-client'
import type { MetricsRepository } from '@/repositories/metrics-repository'
import type { TrainmentsRepository } from '@/repositories/trainments-repository'
import { NotAllowedError } from '../../errors/not-allowed-error'
import { ResourceNotFoundError } from '../../errors/resource-not-found-error'

interface FetchTrainmentMetricsUseCaseRequest {
  userId: string
  trainmentId: string
}

interface FetchTrainmentMetricsUseCaseResponse {
  metrics: Metric[]
}

/**
 * Per-set diffs for a finished session (09_METRICS). Ownership-checked. Returns
 * an empty list when metrics haven't been computed yet (eventual consistency).
 */
export class FetchTrainmentMetricsUseCase {
  constructor(
    private metricsRepository: MetricsRepository,
    private trainmentsRepository: TrainmentsRepository,
  ) {}

  async execute({
    userId,
    trainmentId,
  }: FetchTrainmentMetricsUseCaseRequest): Promise<FetchTrainmentMetricsUseCaseResponse> {
    const trainment = await this.trainmentsRepository.findById(trainmentId)

    if (!trainment) {
      throw new ResourceNotFoundError()
    }

    if (trainment.user_id !== userId) {
      throw new NotAllowedError()
    }

    const metrics =
      await this.metricsRepository.findManyByTrainmentId(trainmentId)

    return { metrics }
  }
}
