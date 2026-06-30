import type { Exercise, Prisma, Set as SetModel } from '@prisma-client'
import type { ExerciseTemplatesRepository } from '@/repositories/exercise-templates-repository'
import type { ExercisesRepository } from '@/repositories/exercises-repository'
import type { TrainmentTemplatesRepository } from '@/repositories/trainment-templates-repository'
import type { TrainmentsRepository } from '@/repositories/trainments-repository'
import { NotAllowedError } from '../../errors/not-allowed-error'
import { ResourceNotFoundError } from '../../errors/resource-not-found-error'
import type { PlannedSets } from '../../_types/planned-sets'
import type { CreateSetsForExerciseUseCase } from '../../sets/create-sets-for-exercise/create-sets-for-exercise'

interface AddExerciseToTrainmentUseCaseRequest {
  userId: string
  trainmentId: string
  exerciseTemplateId: string
  plannedSets: PlannedSets
}

interface AddExerciseToTrainmentUseCaseResponse {
  exercise: Exercise
  sets: SetModel[]
}

/**
 * Online path: create the performed exercise with its device-authored
 * planned_sets, then materialize its set rows (module 06) so the count
 * invariant holds immediately.
 */
export class AddExerciseToTrainmentUseCase {
  constructor(
    private exercisesRepository: ExercisesRepository,
    private trainmentsRepository: TrainmentsRepository,
    private exerciseTemplatesRepository: ExerciseTemplatesRepository,
    private trainmentTemplatesRepository: TrainmentTemplatesRepository,
    private createSetsForExerciseUseCase: CreateSetsForExerciseUseCase,
  ) {}

  async execute({
    userId,
    trainmentId,
    exerciseTemplateId,
    plannedSets,
  }: AddExerciseToTrainmentUseCaseRequest): Promise<AddExerciseToTrainmentUseCaseResponse> {
    const trainment = await this.trainmentsRepository.findById(trainmentId)

    if (!trainment) {
      throw new ResourceNotFoundError()
    }

    if (trainment.user_id !== userId) {
      throw new NotAllowedError()
    }

    const exerciseTemplate =
      await this.exerciseTemplatesRepository.findById(exerciseTemplateId)

    if (!exerciseTemplate) {
      throw new ResourceNotFoundError()
    }

    // The plan slot must belong to the same user (via its trainment template).
    const trainmentTemplate =
      await this.trainmentTemplatesRepository.findById(
        exerciseTemplate.trainment_template_id,
      )

    if (!trainmentTemplate) {
      throw new ResourceNotFoundError()
    }

    if (trainmentTemplate.user_id !== userId) {
      throw new NotAllowedError()
    }

    const exercise = await this.exercisesRepository.create({
      trainment_id: trainmentId,
      exercise_template_id: exerciseTemplateId,
      planned_sets: plannedSets as unknown as Prisma.InputJsonValue,
    })

    const { sets } = await this.createSetsForExerciseUseCase.execute({
      userId,
      trainmentId,
      exerciseId: exercise.id,
      plannedSets,
    })

    return { exercise, sets }
  }
}
