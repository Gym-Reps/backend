import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { plannedSetsSchema } from '@/http/controllers/_schemas/planned-sets-schema'
import { makeSyncTrainmentUseCase } from '@/use-cases/_factories/make-sync-trainment-use-case'
import { InvalidSetIndexError } from '@/use-cases/errors/invalid-set-index-error'
import { NotAllowedError } from '@/use-cases/errors/not-allowed-error'
import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error'
import { SyncConflictError } from '@/use-cases/errors/sync-conflict-error'
import type { PlannedSets } from '@/use-cases/_types/planned-sets'
import { exerciseToHTTP } from '../../exercises/exercise-presenter'
import { setToHTTP } from '../../sets/set-presenter'
import { trainmentToHTTP } from '../trainment-presenter'

const setSchema = z.object({
  id: z.uuid(),
  index: z.number().int().min(1),
  weight: z.number().min(0).nullable(),
  repetitions: z.number().int().min(0).nullable(),
  performedAt: z.coerce.date(),
})

const exerciseSchema = z
  .object({
    id: z.uuid(),
    exerciseTemplateId: z.uuid(),
    plannedSets: plannedSetsSchema,
    sets: z.array(setSchema),
  })
  .refine((exercise) => exercise.sets.length === Object.keys(exercise.plannedSets).length, {
    message: 'sets count must equal plannedSets length',
  })
  .refine(
    (exercise) => {
      const indices = exercise.sets.map((set) => set.index).sort((a, b) => a - b)
      return indices.every((value, position) => value === position + 1)
    },
    { message: 'set indices must be contiguous 1..N' },
  )

const syncTrainmentBodySchema = z.object({
  id: z.uuid(),
  trainmentTemplateId: z.uuid(),
  startedAt: z.coerce.date(),
  finishedAt: z.coerce.date().nullable(),
  exercises: z.array(exerciseSchema),
})

export async function syncTrainment(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const body = syncTrainmentBodySchema.parse(request.body)

  try {
    const useCase = makeSyncTrainmentUseCase()

    const { trainment, exercises, sets, created } = await useCase.execute({
      userId: request.user.sub,
      id: body.id,
      trainmentTemplateId: body.trainmentTemplateId,
      startedAt: body.startedAt,
      finishedAt: body.finishedAt,
      exercises: body.exercises.map((exercise) => ({
        id: exercise.id,
        exerciseTemplateId: exercise.exerciseTemplateId,
        plannedSets: exercise.plannedSets as PlannedSets,
        sets: exercise.sets.map((set) => ({
          id: set.id,
          index: set.index,
          weight: set.weight,
          repetitions: set.repetitions,
          performedAt: set.performedAt,
        })),
      })),
    })

    // 201 on first sync, 200 on an idempotent re-sync (same client-generated id).
    return reply.status(created ? 201 : 200).send({
      trainment: trainmentToHTTP(trainment),
      exercises: exercises.map(exerciseToHTTP),
      sets: sets.map(setToHTTP),
    })
  } catch (err) {
    if (err instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: err.message })
    }

    if (err instanceof NotAllowedError) {
      return reply.status(403).send({ message: err.message })
    }

    if (err instanceof SyncConflictError) {
      return reply.status(409).send({ message: err.message })
    }

    if (err instanceof InvalidSetIndexError) {
      return reply.status(409).send({ message: err.message })
    }

    throw err
  }
}
