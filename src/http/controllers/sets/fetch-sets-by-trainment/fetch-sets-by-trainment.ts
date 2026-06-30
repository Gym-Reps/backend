import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeFetchSetsByTrainmentUseCase } from '@/use-cases/_factories/make-fetch-sets-by-trainment-use-case'
import { NotAllowedError } from '@/use-cases/errors/not-allowed-error'
import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error'
import { setToHTTP } from '../set-presenter'

export async function fetchSetsByTrainment(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const paramsSchema = z.object({ id: z.uuid() })
  const { id } = paramsSchema.parse(request.params)

  try {
    const useCase = makeFetchSetsByTrainmentUseCase()

    const { sets } = await useCase.execute({
      userId: request.user.sub,
      trainmentId: id,
    })

    return reply.status(200).send({ sets: sets.map(setToHTTP) })
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
