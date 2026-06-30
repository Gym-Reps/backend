import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeFetchSetsByExerciseUseCase } from '@/use-cases/_factories/make-fetch-sets-by-exercise-use-case'
import { NotAllowedError } from '@/use-cases/errors/not-allowed-error'
import { setToHTTP } from '../set-presenter'

export async function fetchSetsByExercise(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const paramsSchema = z.object({ id: z.uuid() })
  const { id } = paramsSchema.parse(request.params)

  try {
    const useCase = makeFetchSetsByExerciseUseCase()

    const { sets } = await useCase.execute({
      userId: request.user.sub,
      exerciseId: id,
    })

    return reply.status(200).send({ sets: sets.map(setToHTTP) })
  } catch (err) {
    if (err instanceof NotAllowedError) {
      return reply.status(403).send({ message: err.message })
    }

    throw err
  }
}
