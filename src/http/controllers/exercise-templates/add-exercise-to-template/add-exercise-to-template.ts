import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeAddExerciseToTemplateUseCase } from '@/use-cases/_factories/make-add-exercise-to-template-use-case'
import { NotAllowedError } from '@/use-cases/errors/not-allowed-error'
import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error'
import { exerciseTemplateToHTTP } from '../exercise-template-presenter'

export async function addExerciseToTemplate(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const paramsSchema = z.object({ id: z.uuid() })
  const bodySchema = z.object({ exerciseCatalogId: z.uuid() })

  const { id } = paramsSchema.parse(request.params)
  const { exerciseCatalogId } = bodySchema.parse(request.body)

  try {
    const useCase = makeAddExerciseToTemplateUseCase()

    const { exerciseTemplate } = await useCase.execute({
      userId: request.user.sub,
      trainmentTemplateId: id,
      exerciseCatalogId,
    })

    return reply
      .status(201)
      .send({ exerciseTemplate: exerciseTemplateToHTTP(exerciseTemplate) })
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
