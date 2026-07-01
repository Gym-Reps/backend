import { randomUUID } from 'node:crypto'
import type { Event, Exercise, Set as SetModel, Trainment } from '@prisma-client'
import { SyncConflictError } from '@/use-cases/errors/sync-conflict-error'
import type {
  PersistedTrainmentGraph,
  TrainmentGraph,
  TrainmentSyncRepository,
} from '../trainment-sync-repository'

export class InMemoryTrainmentSyncRepository
  implements TrainmentSyncRepository
{
  public trainments: Trainment[] = []
  public exercises: Exercise[] = []
  public sets: SetModel[] = []
  public events: Event[] = []

  async persistTrainmentGraph(
    graph: TrainmentGraph,
  ): Promise<PersistedTrainmentGraph> {
    // --- validate up front, mutate nothing until every check passes, so a
    // rejected graph leaves the store untouched (atomicity contract). ---
    const existingTrainment = this.trainments.find((t) => t.id === graph.id)

    if (existingTrainment && existingTrainment.user_id !== graph.userId) {
      throw new SyncConflictError()
    }

    for (const exercise of graph.exercises) {
      for (const set of exercise.sets) {
        const existingSet = this.sets.find((s) => s.id === set.id)
        // A client-generated set id that resurfaces under a different exercise
        // is a conflict upsert can't reconcile.
        if (existingSet && existingSet.exercise_id !== exercise.id) {
          throw new SyncConflictError()
        }
      }
    }

    const created = !existingTrainment

    // --- commit: upsert by the client-generated ids. ---
    const trainment: Trainment = {
      id: graph.id,
      trainment_template_id: graph.trainmentTemplateId,
      user_id: graph.userId,
      started_at: graph.startedAt,
      finished_at: graph.finishedAt,
    }
    this.upsertTrainment(trainment)

    const persistedExercises: Exercise[] = []
    const persistedSets: SetModel[] = []

    for (const exerciseInput of graph.exercises) {
      const previous = this.exercises.find((e) => e.id === exerciseInput.id)
      const exercise: Exercise = {
        id: exerciseInput.id,
        exercise_template_id: exerciseInput.exerciseTemplateId,
        trainment_id: graph.id,
        planned_sets:
          exerciseInput.plannedSets as unknown as Exercise['planned_sets'],
        created_at: previous?.created_at ?? new Date(),
      }
      this.upsertExercise(exercise)
      persistedExercises.push(exercise)

      for (const setInput of exerciseInput.sets) {
        const set: SetModel = {
          id: setInput.id,
          trainment_id: graph.id,
          exercise_id: exerciseInput.id,
          user_id: graph.userId, // forced from the caller, never the payload
          index: setInput.index,
          weight: setInput.weight,
          repetitions: setInput.repetitions,
          performed_at: setInput.performedAt,
        }
        this.upsertSet(set)
        persistedSets.push(set)
      }
    }

    // Outbox: the metrics-trigger event, written as part of the same graph.
    const now = new Date()
    const event: Event = {
      id: randomUUID(),
      event_type: 'COMPUTE_TRAINMENT_METRICS',
      status: 'PENDING',
      user_id: graph.userId,
      metadata: { trainmentId: graph.id } as unknown as Event['metadata'],
      attempts: 0,
      last_error: null,
      created_at: now,
      updated_at: now,
      processed_at: null,
    }
    this.events.push(event)

    return {
      trainment,
      exercises: persistedExercises,
      sets: persistedSets,
      created,
      eventId: event.id,
    }
  }

  private upsertTrainment(trainment: Trainment) {
    const index = this.trainments.findIndex((t) => t.id === trainment.id)
    if (index >= 0) {
      this.trainments[index] = trainment
    } else {
      this.trainments.push(trainment)
    }
  }

  private upsertExercise(exercise: Exercise) {
    const index = this.exercises.findIndex((e) => e.id === exercise.id)
    if (index >= 0) {
      this.exercises[index] = exercise
    } else {
      this.exercises.push(exercise)
    }
  }

  private upsertSet(set: SetModel) {
    const index = this.sets.findIndex((s) => s.id === set.id)
    if (index >= 0) {
      this.sets[index] = set
    } else {
      this.sets.push(set)
    }
  }
}
