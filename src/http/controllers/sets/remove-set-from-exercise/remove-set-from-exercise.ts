import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeRemoveSetFromExerciseUseCase } from '@/use-cases/_factories/make-remove-set-from-exercise-use-case'
import { InvalidSetIndexError } from '@/use-cases/errors/invalid-set-index-error'
import { NotAllowedError } from '@/use-cases/errors/not-allowed-error'
import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error'

export async function removeSetFromExercise(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const paramsSchema = z.object({ id: z.uuid() })
  const { id } = paramsSchema.parse(request.params)

  try {
    const useCase = makeRemoveSetFromExerciseUseCase()

    await useCase.execute({
      userId: request.user.sub,
      setId: id,
    })
  } catch (err) {
    if (err instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: err.message })
    }

    if (err instanceof NotAllowedError) {
      return reply.status(403).send({ message: err.message })
    }

    if (err instanceof InvalidSetIndexError) {
      return reply.status(409).send({ message: err.message })
    }

    throw err
  }

  return reply.status(204).send()
}
