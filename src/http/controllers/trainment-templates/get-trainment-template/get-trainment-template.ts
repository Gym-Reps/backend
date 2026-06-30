import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeGetTrainmentTemplateUseCase } from '@/use-cases/_factories/make-get-trainment-template-use-case'
import { NotAllowedError } from '@/use-cases/errors/not-allowed-error'
import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error'
import { trainmentTemplateToHTTP } from '../trainment-template-presenter'

export async function getTrainmentTemplate(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const getTrainmentTemplateParamsSchema = z.object({
    id: z.uuid(),
  })

  const { id } = getTrainmentTemplateParamsSchema.parse(request.params)

  try {
    const getTrainmentTemplateUseCase = makeGetTrainmentTemplateUseCase()

    const { trainmentTemplate } = await getTrainmentTemplateUseCase.execute({
      userId: request.user.sub,
      trainmentTemplateId: id,
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
