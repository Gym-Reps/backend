import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeGetTrainmentUseCase } from '@/use-cases/_factories/make-get-trainment-use-case'
import { NotAllowedError } from '@/use-cases/errors/not-allowed-error'
import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error'
import { trainmentToHTTP } from '../trainment-presenter'

export async function getTrainment(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const getTrainmentParamsSchema = z.object({
    id: z.uuid(),
  })

  const { id } = getTrainmentParamsSchema.parse(request.params)

  try {
    const getTrainmentUseCase = makeGetTrainmentUseCase()

    const { trainment } = await getTrainmentUseCase.execute({
      userId: request.user.sub,
      trainmentId: id,
    })

    return reply.status(200).send({ trainment: trainmentToHTTP(trainment) })
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
