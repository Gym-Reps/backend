import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeFetchTemplateExercisesUseCase } from '@/use-cases/_factories/make-fetch-template-exercises-use-case'
import { NotAllowedError } from '@/use-cases/errors/not-allowed-error'
import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error'
import { exerciseTemplateToHTTP } from '../exercise-template-presenter'

export async function fetchTemplateExercises(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const paramsSchema = z.object({ id: z.uuid() })
  const { id } = paramsSchema.parse(request.params)

  try {
    const useCase = makeFetchTemplateExercisesUseCase()

    const { exerciseTemplates } = await useCase.execute({
      userId: request.user.sub,
      trainmentTemplateId: id,
    })

    return reply
      .status(200)
      .send({ exercises: exerciseTemplates.map(exerciseTemplateToHTTP) })
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
