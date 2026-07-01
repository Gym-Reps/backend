import type { Exercise, Prisma, Set as SetModel } from '@prisma-client'
import { prisma } from '@/lib/prisma'
import { SyncConflictError } from '@/use-cases/errors/sync-conflict-error'
import type {
  PersistedTrainmentGraph,
  TrainmentGraph,
  TrainmentSyncRepository,
} from '../trainment-sync-repository'

export class PrismaTrainmentSyncRepository
  implements TrainmentSyncRepository
{
  async persistTrainmentGraph(
    graph: TrainmentGraph,
  ): Promise<PersistedTrainmentGraph> {
    // One interactive transaction: trainment → exercises → sets, upserting by
    // the client-generated ids so a retry re-applies in place (idempotent) and
    // any failure rolls the whole graph back (atomic).
    return prisma.$transaction(async (tx) => {
      const existing = await tx.trainment.findUnique({ where: { id: graph.id } })

      if (existing && existing.user_id !== graph.userId) {
        throw new SyncConflictError()
      }

      const created = !existing

      const trainment = await tx.trainment.upsert({
        where: { id: graph.id },
        create: {
          id: graph.id,
          trainment_template_id: graph.trainmentTemplateId,
          user_id: graph.userId,
          started_at: graph.startedAt,
          finished_at: graph.finishedAt,
        },
        update: {
          started_at: graph.startedAt,
          finished_at: graph.finishedAt,
        },
      })

      const exercises: Exercise[] = []
      const sets: SetModel[] = []

      for (const exerciseInput of graph.exercises) {
        const plannedSets =
          exerciseInput.plannedSets as unknown as Prisma.InputJsonValue

        const exercise = await tx.exercise.upsert({
          where: { id: exerciseInput.id },
          create: {
            id: exerciseInput.id,
            trainment_id: graph.id,
            exercise_template_id: exerciseInput.exerciseTemplateId,
            planned_sets: plannedSets,
          },
          update: {
            planned_sets: plannedSets,
          },
        })
        exercises.push(exercise)

        for (const setInput of exerciseInput.sets) {
          const set = await tx.set.upsert({
            where: { id: setInput.id },
            create: {
              id: setInput.id,
              trainment_id: graph.id,
              exercise_id: exerciseInput.id,
              user_id: graph.userId, // forced from the caller, never the payload
              index: setInput.index,
              weight: setInput.weight,
              repetitions: setInput.repetitions,
              performed_at: setInput.performedAt,
            },
            update: {
              index: setInput.index,
              weight: setInput.weight,
              repetitions: setInput.repetitions,
              performed_at: setInput.performedAt,
              user_id: graph.userId,
            },
          })
          sets.push(set)
        }
      }

      // TODO(08_EVENTS_MODULE): within this same transaction, insert a
      // COMPUTE_TRAINMENT_METRICS `events` row (outbox) for { trainmentId: graph.id }
      // and dispatch its BullMQ job after commit, so every synced session gets
      // metrics queued. Deferred until the events module lands (mirrors the
      // finish-trainment enqueue deferral in 01_TRAINMENT_MODULE).

      return { trainment, exercises, sets, created }
    })
  }
}
