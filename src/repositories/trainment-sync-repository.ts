import type { Exercise, Set as SetModel, Trainment } from '@prisma-client'
import type { PlannedSets } from '@/use-cases/_types/planned-sets'

/**
 * The offline-first sync payload (07_OFFLINE_SYNC_MODULE), already validated and
 * normalized by the use-case: `userId` is forced from the JWT, so every persisted
 * row is owned by the caller regardless of what the device sent. All ids are
 * client-generated, which is what makes the whole graph resolvable without a
 * server round-trip and idempotent on retry (upsert by id).
 */
export interface SyncSetInput {
  id: string
  index: number
  weight: number | null
  repetitions: number | null
  performedAt: Date
}

export interface SyncExerciseInput {
  id: string
  exerciseTemplateId: string
  sets: SyncSetInput[]
  plannedSets: PlannedSets
}

export interface TrainmentGraph {
  id: string
  trainmentTemplateId: string
  userId: string
  startedAt: Date
  finishedAt: Date | null
  exercises: SyncExerciseInput[]
}

export interface PersistedTrainmentGraph {
  trainment: Trainment
  exercises: Exercise[]
  sets: SetModel[]
  /** true when this sync created the trainment (→ 201), false on idempotent re-sync (→ 200). */
  created: boolean
}

export interface TrainmentSyncRepository {
  /**
   * Persists the whole graph atomically as one unit (upsert trainment →
   * exercises → sets, in that order so FKs exist before children reference
   * them). Any failure must leave nothing written. Idempotent: re-applying the
   * same client-generated ids updates in place rather than duplicating.
   */
  persistTrainmentGraph(graph: TrainmentGraph): Promise<PersistedTrainmentGraph>
}
