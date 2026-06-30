import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeFinishTrainmentUseCase } from '@/use-cases/_factories/make-finish-trainment-use-case'
import { NotAllowedError } from '@/use-cases/errors/not-allowed-error'
import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error'
import { TrainmentAlreadyFinishedError } from '@/use-cases/errors/trainment-already-finished-error'
import { trainmentToHTTP } from '../trainment-presenter'

export async function finishTrainment(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const finishTrainmentParamsSchema = z.object({
    id: z.uuid(),
  })

  const { id } = finishTrainmentParamsSchema.parse(request.params)

  try {
    const finishTrainmentUseCase = makeFinishTrainmentUseCase()

    const { trainment } = await finishTrainmentUseCase.execute({
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

    if (err instanceof TrainmentAlreadyFinishedError) {
      return reply.status(409).send({ message: err.message })
    }

    throw err
  }
}
