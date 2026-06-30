import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeUpdateTrainmentTemplateUseCase } from '@/use-cases/_factories/make-update-trainment-template-use-case'
import { NotAllowedError } from '@/use-cases/errors/not-allowed-error'
import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error'
import { trainmentTemplateToHTTP } from '../trainment-template-presenter'

export async function updateTrainmentTemplate(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const updateTrainmentTemplateParamsSchema = z.object({
    id: z.uuid(),
  })
  const updateTrainmentTemplateBodySchema = z.object({
    title: z.string().min(1),
  })

  const { id } = updateTrainmentTemplateParamsSchema.parse(request.params)
  const { title } = updateTrainmentTemplateBodySchema.parse(request.body)

  try {
    const updateTrainmentTemplateUseCase = makeUpdateTrainmentTemplateUseCase()

    const { trainmentTemplate } = await updateTrainmentTemplateUseCase.execute({
      userId: request.user.sub,
      trainmentTemplateId: id,
      title,
    })

    return reply
      .status(200)
      .send({ trainmentTemplate: trainmentTemplateToHTTP(trainmentTemplate) })
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
