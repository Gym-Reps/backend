import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeFetchExerciseMetricsUseCase } from '@/use-cases/_factories/make-fetch-exercise-metrics-use-case'
import { NotAllowedError } from '@/use-cases/errors/not-allowed-error'
import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error'
import { metricToHTTP } from '../metric-presenter'

export async function fetchExerciseMetrics(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const paramsSchema = z.object({ id: z.uuid() })
  const { id } = paramsSchema.parse(request.params)

  try {
    const useCase = makeFetchExerciseMetricsUseCase()

    const { metrics } = await useCase.execute({
      userId: request.user.sub,
      exerciseId: id,
    })

    return reply.status(200).send({ metrics: metrics.map(metricToHTTP) })
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
