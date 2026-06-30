import type { Set as SetModel } from '@prisma-client'
import type { ExercisesRepository } from '@/repositories/exercises-repository'
import type { SetsRepository } from '@/repositories/sets-repository'
import type { TrainmentsRepository } from '@/repositories/trainments-repository'
import { NotAllowedError } from '../../errors/not-allowed-error'
import { ResourceNotFoundError } from '../../errors/resource-not-found-error'
import { asPlannedSets, plannedSetCount } from '../../_types/planned-sets'

interface AddSetToExerciseUseCaseRequest {
  userId: string
  exerciseId: string
  weight?: number
  minReps?: number
  maxReps?: number
}

interface AddSetToExerciseUseCaseResponse {
  set: SetModel
}

/**
 * Appends index N+1: extends `planned_sets` and inserts the matching `set` row
 * together, preserving the count invariant. New plan entry defaults to the
 * previous set's plan when fields are omitted.
 */
export class AddSetToExerciseUseCase {
  constructor(
    private setsRepository: SetsRepository,
    private exercisesRepository: ExercisesRepository,
    private trainmentsRepository: TrainmentsRepository,
  ) {}

  async execute({
    userId,
    exerciseId,
    weight,
    minReps,
    maxReps,
  }: AddSetToExerciseUseCaseRequest): Promise<AddSetToExerciseUseCaseResponse> {
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

    const plannedSets = { ...asPlannedSets(exercise.planned_sets) }
    const previousIndex = plannedSetCount(plannedSets)
    const newIndex = previousIndex + 1
    const previous = plannedSets[String(previousIndex)]

    plannedSets[String(newIndex)] = {
      weight: weight ?? previous?.weight ?? null,
      min_reps: minReps ?? previous?.min_reps ?? null,
      max_reps: maxReps ?? previous?.max_reps ?? null,
    }

    exercise.planned_sets = plannedSets as unknown as typeof exercise.planned_sets
    await this.exercisesRepository.save(exercise)

    const [set] = await this.setsRepository.createMany([
      {
        trainment_id: exercise.trainment_id,
        exercise_id: exerciseId,
        user_id: userId,
        index: newIndex,
        weight: null,
        repetitions: null,
      },
    ])

    return { set: set! }
  }
}
