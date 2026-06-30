import type { ExercisesRepository } from '@/repositories/exercises-repository'
import type { SetsRepository } from '@/repositories/sets-repository'
import { InvalidSetIndexError } from '../../errors/invalid-set-index-error'
import { NotAllowedError } from '../../errors/not-allowed-error'
import { ResourceNotFoundError } from '../../errors/resource-not-found-error'
import { asPlannedSets, plannedSetCount } from '../../_types/planned-sets'

interface RemoveSetFromExerciseUseCaseRequest {
  userId: string
  setId: string
}

/**
 * Removes the **last** index N: deletes the `set` row and drops its
 * `planned_sets` key together, keeping `1..N` contiguous. Rejects any non-last
 * index so the count invariant and contiguity are preserved.
 */
export class RemoveSetFromExerciseUseCase {
  constructor(
    private setsRepository: SetsRepository,
    private exercisesRepository: ExercisesRepository,
  ) {}

  async execute({
    userId,
    setId,
  }: RemoveSetFromExerciseUseCaseRequest): Promise<void> {
    const set = await this.setsRepository.findById(setId)

    if (!set) {
      throw new ResourceNotFoundError()
    }

    if (set.user_id !== userId) {
      throw new NotAllowedError()
    }

    const exercise = await this.exercisesRepository.findById(set.exercise_id)

    if (!exercise) {
      throw new ResourceNotFoundError()
    }

    const plannedSets = { ...asPlannedSets(exercise.planned_sets) }
    const lastIndex = plannedSetCount(plannedSets)

    if (set.index !== lastIndex) {
      throw new InvalidSetIndexError()
    }

    delete plannedSets[String(lastIndex)]
    exercise.planned_sets = plannedSets as unknown as typeof exercise.planned_sets

    await this.setsRepository.delete(set.id)
    await this.exercisesRepository.save(exercise)
  }
}
