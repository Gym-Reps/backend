import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeUpdateSetUseCase } from '@/use-cases/_factories/make-update-set-use-case'
import { NotAllowedError } from '@/use-cases/errors/not-allowed-error'
import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error'
import { setToHTTP } from '../set-presenter'

export async function updateSet(request: FastifyRequest, reply: FastifyReply) {
  const paramsSchema = z.object({ id: z.uuid() })
  const bodySchema = z
    .object({
      weight: z.number().min(0).optional(),
      repetitions: z.number().int().min(0).optional(),
      performedAt: z.coerce.date().optional(),
    })
    .refine((value) => Object.keys(value).length > 0, {
      message: 'Provide at least one field',
    })

  const { id } = paramsSchema.parse(request.params)
  const { weight, repetitions, performedAt } = bodySchema.parse(request.body)

  try {
    const useCase = makeUpdateSetUseCase()

    const { set } = await useCase.execute({
      userId: request.user.sub,
      setId: id,
      ...(weight !== undefined ? { weight } : {}),
      ...(repetitions !== undefined ? { repetitions } : {}),
      ...(performedAt !== undefined ? { performedAt } : {}),
    })

    return reply.status(200).send({ set: setToHTTP(set) })
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
