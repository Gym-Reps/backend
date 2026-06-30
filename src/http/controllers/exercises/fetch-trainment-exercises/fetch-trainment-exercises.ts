import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeFetchTrainmentExercisesUseCase } from '@/use-cases/_factories/make-fetch-trainment-exercises-use-case'
import { NotAllowedError } from '@/use-cases/errors/not-allowed-error'
import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error'
import { exerciseToHTTP } from '../exercise-presenter'

export async function fetchTrainmentExercises(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const paramsSchema = z.object({ id: z.uuid() })
  const { id } = paramsSchema.parse(request.params)

  try {
    const useCase = makeFetchTrainmentExercisesUseCase()

    const { exercises } = await useCase.execute({
      userId: request.user.sub,
      trainmentId: id,
    })

    return reply.status(200).send({ exercises: exercises.map(exerciseToHTTP) })
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
