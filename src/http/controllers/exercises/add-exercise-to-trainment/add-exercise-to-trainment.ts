import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { plannedSetsSchema } from '@/http/controllers/_schemas/planned-sets-schema'
import { makeAddExerciseToTrainmentUseCase } from '@/use-cases/_factories/make-add-exercise-to-trainment-use-case'
import { NotAllowedError } from '@/use-cases/errors/not-allowed-error'
import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error'
import type { PlannedSets } from '@/use-cases/_types/planned-sets'
import { exerciseToHTTP } from '../exercise-presenter'
import { setToHTTP } from '../../sets/set-presenter'

export async function addExerciseToTrainment(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const paramsSchema = z.object({ id: z.uuid() })
  const bodySchema = z.object({
    exerciseTemplateId: z.uuid(),
    plannedSets: plannedSetsSchema,
  })

  const { id } = paramsSchema.parse(request.params)
  const { exerciseTemplateId, plannedSets } = bodySchema.parse(request.body)

  try {
    const useCase = makeAddExerciseToTrainmentUseCase()

    const { exercise, sets } = await useCase.execute({
      userId: request.user.sub,
      trainmentId: id,
      exerciseTemplateId,
      plannedSets: plannedSets as PlannedSets,
    })

    return reply.status(201).send({
      exercise: exerciseToHTTP(exercise),
      sets: sets.map(setToHTTP),
    })
  } catch (err) {
    if (err instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: err.message })
    }

    if (err instanceof NotAllowedError) {
      return reply.status(403).send({ message: err.message })
    }

    throw err
  }
}
