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

      // Outbox: write the COMPUTE_TRAINMENT_METRICS event inside this same
      // transaction, so a synced session and its metrics-trigger commit together
      // (never one without the other). The use-case adds the BullMQ job after
      // commit; the sweeper re-enqueues if that add is lost.
      const event = await tx.event.create({
        data: {
          event_type: 'COMPUTE_TRAINMENT_METRICS',
          user_id: graph.userId,
          metadata: { trainmentId: graph.id },
        },
      })

      return { trainment, exercises, sets, created, eventId: event.id }
    })
  }
}
