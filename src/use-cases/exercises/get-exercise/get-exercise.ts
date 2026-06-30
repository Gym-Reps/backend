import type { Exercise } from '@prisma-client'
import type { ExercisesRepository } from '@/repositories/exercises-repository'
import type { TrainmentsRepository } from '@/repositories/trainments-repository'
import { NotAllowedError } from '../../errors/not-allowed-error'
import { ResourceNotFoundError } from '../../errors/resource-not-found-error'

interface GetExerciseUseCaseRequest {
  userId: string
  exerciseId: string
}

interface GetExerciseUseCaseResponse {
  exercise: Exercise
}

export class GetExerciseUseCase {
  constructor(
    private exercisesRepository: ExercisesRepository,
    private trainmentsRepository: TrainmentsRepository,
  ) {}

  async execute({
    userId,
    exerciseId,
  }: GetExerciseUseCaseRequest): Promise<GetExerciseUseCaseResponse> {
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

    return { exercise }
  }
}
