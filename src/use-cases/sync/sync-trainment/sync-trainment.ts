import type { ExerciseTemplatesRepository } from '@/repositories/exercise-templates-repository'
import type { TrainmentTemplatesRepository } from '@/repositories/trainment-templates-repository'
import type {
  PersistedTrainmentGraph,
  SyncExerciseInput,
  TrainmentSyncRepository,
} from '@/repositories/trainment-sync-repository'
import { InvalidSetIndexError } from '../../errors/invalid-set-index-error'
import { NotAllowedError } from '../../errors/not-allowed-error'
import { ResourceNotFoundError } from '../../errors/resource-not-found-error'
import { plannedSetCount } from '../../_types/planned-sets'

interface SyncTrainmentUseCaseRequest {
  userId: string
  id: string
  trainmentTemplateId: string
  startedAt: Date
  finishedAt: Date | null
  exercises: SyncExerciseInput[]
}

/**
 * Primary write path for a completed offline session (07_OFFLINE_SYNC_MODULE).
 * Validates root ownership + the per-exercise set invariant, forces `user_id`
 * from the JWT, then hands the whole graph to a single transactional repository
 * call. Stays persistence-agnostic — the transaction boundary lives in the repo.
 */
export class SyncTrainmentUseCase {
  constructor(
    private trainmentSyncRepository: TrainmentSyncRepository,
    private trainmentTemplatesRepository: TrainmentTemplatesRepository,
    private exerciseTemplatesRepository: ExerciseTemplatesRepository,
  ) {}

  async execute({
    userId,
    id,
    trainmentTemplateId,
    startedAt,
    finishedAt,
    exercises,
  }: SyncTrainmentUseCaseRequest): Promise<PersistedTrainmentGraph> {
    // 1. Root ownership: one check on the template the whole graph descends from.
    const trainmentTemplate =
      await this.trainmentTemplatesRepository.findById(trainmentTemplateId)

    if (!trainmentTemplate) {
      throw new ResourceNotFoundError()
    }

    if (trainmentTemplate.user_id !== userId) {
      throw new NotAllowedError()
    }

    // 2. Each exercise template must exist and belong to that same template,
    //    and each exercise must satisfy the set-count invariant.
    for (const exercise of exercises) {
      const exerciseTemplate = await this.exerciseTemplatesRepository.findById(
        exercise.exerciseTemplateId,
      )

      if (!exerciseTemplate) {
        throw new ResourceNotFoundError()
      }

      if (exerciseTemplate.trainment_template_id !== trainmentTemplateId) {
        throw new NotAllowedError()
      }

      this.assertSetInvariant(exercise)
    }

    // 3. Persist atomically; user_id is forced from the caller for every row.
    return this.trainmentSyncRepository.persistTrainmentGraph({
      id,
      trainmentTemplateId,
      userId,
      startedAt,
      finishedAt,
      exercises,
    })
  }

  /**
   * Re-asserts the invariant Zod also enforces at the edge: exactly one set per
   * planned index, with contiguous 1..N indices. Defensive — guards the use-case
   * when invoked outside the HTTP layer (e.g. unit tests, future batch sync).
   */
  private assertSetInvariant(exercise: SyncExerciseInput) {
    const indices = exercise.sets.map((set) => set.index).sort((a, b) => a - b)
    const contiguous = indices.every((value, position) => value === position + 1)

    if (
      exercise.sets.length !== plannedSetCount(exercise.plannedSets) ||
      !contiguous
    ) {
      throw new InvalidSetIndexError()
    }
  }
}
