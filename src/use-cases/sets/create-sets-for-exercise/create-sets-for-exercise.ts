import type { Set as SetModel } from '@prisma-client'
import type { SetsRepository } from '@/repositories/sets-repository'
import { type PlannedSets, plannedSetIndices } from '../../_types/planned-sets'

interface CreateSetsForExerciseUseCaseRequest {
  userId: string
  trainmentId: string
  exerciseId: string
  plannedSets: PlannedSets
}

interface CreateSetsForExerciseUseCaseResponse {
  sets: SetModel[]
}

/**
 * Materializes one `set` row per planned index (weight/repetitions null =
 * unlogged), establishing the count invariant
 * `count(sets) === keys(planned_sets)`. Called by the online add-exercise path
 * and the offline sync path.
 */
export class CreateSetsForExerciseUseCase {
  constructor(private setsRepository: SetsRepository) {}

  async execute({
    userId,
    trainmentId,
    exerciseId,
    plannedSets,
  }: CreateSetsForExerciseUseCaseRequest): Promise<CreateSetsForExerciseUseCaseResponse> {
    const sets = await this.setsRepository.createMany(
      plannedSetIndices(plannedSets).map((index) => ({
        trainment_id: trainmentId,
        exercise_id: exerciseId,
        user_id: userId,
        index,
        weight: null,
        repetitions: null,
      })),
    )

    return { sets }
  }
}
