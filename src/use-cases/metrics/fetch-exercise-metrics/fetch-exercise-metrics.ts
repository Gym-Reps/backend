import type { Metric } from '@prisma-client'
import type { ExercisesRepository } from '@/repositories/exercises-repository'
import type { MetricsRepository } from '@/repositories/metrics-repository'
import type { TrainmentsRepository } from '@/repositories/trainments-repository'
import { NotAllowedError } from '../../errors/not-allowed-error'
import { ResourceNotFoundError } from '../../errors/resource-not-found-error'

interface FetchExerciseMetricsUseCaseRequest {
  userId: string
  exerciseId: string
}

interface FetchExerciseMetricsUseCaseResponse {
  metrics: Metric[]
}

/**
 * Per-set diffs for one performed exercise (09_METRICS). Ownership is checked via
 * the owning trainment. Empty list when not yet computed (eventual consistency).
 */
export class FetchExerciseMetricsUseCase {
  constructor(
    private metricsRepository: MetricsRepository,
    private exercisesRepository: ExercisesRepository,
    private trainmentsRepository: TrainmentsRepository,
  ) {}

  async execute({
    userId,
    exerciseId,
  }: FetchExerciseMetricsUseCaseRequest): Promise<FetchExerciseMetricsUseCaseResponse> {
    const exercise = await this.exercisesRepository.findById(exerciseId)

    if (!exercise) {
      throw new ResourceNotFoundError()
    }

    const trainment = await this.trainmentsRepository.findById(
      exercise.trainment_id,
    )

    if (!trainment) {
      throw new ResourceNotFoundError()
    }

    if (trainment.user_id !== userId) {
      throw new NotAllowedError()
    }

    const metrics =
      await this.metricsRepository.findManyByExerciseId(exerciseId)

    return { metrics }
  }
}
