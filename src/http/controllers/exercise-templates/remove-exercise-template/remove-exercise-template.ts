import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeRemoveExerciseTemplateUseCase } from '@/use-cases/_factories/make-remove-exercise-template-use-case'
import { NotAllowedError } from '@/use-cases/errors/not-allowed-error'
import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error'

export async function removeExerciseTemplate(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const paramsSchema = z.object({ id: z.uuid() })
  const { id } = paramsSchema.parse(request.params)

  try {
    const useCase = makeRemoveExerciseTemplateUseCase()

    await useCase.execute({
      userId: request.user.sub,
      exerciseTemplateId: id,
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

  return reply.status(204).send()
}
