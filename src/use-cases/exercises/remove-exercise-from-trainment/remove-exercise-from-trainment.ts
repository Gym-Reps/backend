import type { ExercisesRepository } from '@/repositories/exercises-repository'
import type { SetsRepository } from '@/repositories/sets-repository'
import type { TrainmentsRepository } from '@/repositories/trainments-repository'
import { NotAllowedError } from '../../errors/not-allowed-error'
import { ResourceNotFoundError } from '../../errors/resource-not-found-error'

interface RemoveExerciseFromTrainmentUseCaseRequest {
  userId: string
  exerciseId: string
}

export class RemoveExerciseFromTrainmentUseCase {
  constructor(
    private exercisesRepository: ExercisesRepository,
    private trainmentsRepository: TrainmentsRepository,
    private setsRepository: SetsRepository,
  ) {}

  async execute({
    userId,
    exerciseId,
  }: RemoveExerciseFromTrainmentUseCaseRequest): Promise<void> {
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

    // Remove the leaf sets first to satisfy the FK, then the exercise.
    await this.setsRepository.deleteManyByExerciseId(exerciseId)
    await this.exercisesRepository.delete(exerciseId)
  }
}
