import type { Exercise } from '@prisma-client'
import type { ExercisesRepository } from '@/repositories/exercises-repository'
import type { TrainmentsRepository } from '@/repositories/trainments-repository'
import { NotAllowedError } from '../../errors/not-allowed-error'
import { ResourceNotFoundError } from '../../errors/resource-not-found-error'

interface FetchTrainmentExercisesUseCaseRequest {
  userId: string
  trainmentId: string
}

interface FetchTrainmentExercisesUseCaseResponse {
  exercises: Exercise[]
}

export class FetchTrainmentExercisesUseCase {
  constructor(
    private exercisesRepository: ExercisesRepository,
    private trainmentsRepository: TrainmentsRepository,
  ) {}

  async execute({
    userId,
    trainmentId,
  }: FetchTrainmentExercisesUseCaseRequest): Promise<FetchTrainmentExercisesUseCaseResponse> {
    const trainment = await this.trainmentsRepository.findById(trainmentId)

    if (!trainment) {
      throw new ResourceNotFoundError()
    }

    if (trainment.user_id !== userId) {
      throw new NotAllowedError()
    }

    const exercises =
      await this.exercisesRepository.findManyByTrainmentId(trainmentId)

    return { exercises }
  }
}
