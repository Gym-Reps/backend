import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeDeleteTrainmentTemplateUseCase } from '@/use-cases/_factories/make-delete-trainment-template-use-case'
import { NotAllowedError } from '@/use-cases/errors/not-allowed-error'
import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error'

export async function deleteTrainmentTemplate(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const deleteTrainmentTemplateParamsSchema = z.object({
    id: z.uuid(),
  })

  const { id } = deleteTrainmentTemplateParamsSchema.parse(request.params)

  try {
    const deleteTrainmentTemplateUseCase = makeDeleteTrainmentTemplateUseCase()

    await deleteTrainmentTemplateUseCase.execute({
      userId: request.user.sub,
      trainmentTemplateId: id,
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
