import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeStartTrainmentUseCase } from '@/use-cases/_factories/make-start-trainment-use-case'
import { NotAllowedError } from '@/use-cases/errors/not-allowed-error'
import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error'
import { trainmentToHTTP } from '../trainment-presenter'

export async function startTrainment(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const startTrainmentBodySchema = z.object({
    trainmentTemplateId: z.uuid(),
  })

  const { trainmentTemplateId } = startTrainmentBodySchema.parse(request.body)

  try {
    const startTrainmentUseCase = makeStartTrainmentUseCase()

    const { trainment } = await startTrainmentUseCase.execute({
      userId: request.user.sub,
      trainmentTemplateId,
    })

    return reply.status(201).send({ trainment: trainmentToHTTP(trainment) })
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
