import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeAddSetToExerciseUseCase } from '@/use-cases/_factories/make-add-set-to-exercise-use-case'
import { NotAllowedError } from '@/use-cases/errors/not-allowed-error'
import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error'
import { setToHTTP } from '../set-presenter'

export async function addSetToExercise(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const paramsSchema = z.object({ id: z.uuid() })
  const bodySchema = z.object({
    weight: z.number().optional(),
    minReps: z.number().int().optional(),
    maxReps: z.number().int().optional(),
  })

  const { id } = paramsSchema.parse(request.params)
  const { weight, minReps, maxReps } = bodySchema.parse(request.body ?? {})

  try {
    const useCase = makeAddSetToExerciseUseCase()

    const { set } = await useCase.execute({
      userId: request.user.sub,
      exerciseId: id,
      ...(weight !== undefined ? { weight } : {}),
      ...(minReps !== undefined ? { minReps } : {}),
      ...(maxReps !== undefined ? { maxReps } : {}),
    })

    return reply.status(201).send({ set: setToHTTP(set) })
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
