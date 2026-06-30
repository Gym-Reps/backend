import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeGetExerciseUseCase } from '@/use-cases/_factories/make-get-exercise-use-case'
import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error'
import { catalogExerciseToHTTP } from '../catalog-exercise-presenter'

export async function getExercise(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const getExerciseParamsSchema = z.object({
    id: z.uuid(),
  })

  const { id } = getExerciseParamsSchema.parse(request.params)

  try {
    const getExerciseUseCase = makeGetExerciseUseCase()

    const { exercise } = await getExerciseUseCase.execute({ exerciseId: id })

    return reply
      .status(200)
      .send({ exercise: catalogExerciseToHTTP(exercise) })
  } catch (err) {
    if (err instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: err.message })
    }

    throw err
  }
}
