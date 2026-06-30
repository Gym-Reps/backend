import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeFetchUserTrainmentsUseCase } from '@/use-cases/_factories/make-fetch-user-trainments-use-case'
import { trainmentToHTTP } from '../trainment-presenter'

export async function fetchUserTrainments(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const fetchUserTrainmentsQuerySchema = z.object({
    trainmentTemplateId: z.uuid().optional(),
    page: z.coerce.number().int().min(1).default(1),
  })

  const { trainmentTemplateId, page } = fetchUserTrainmentsQuerySchema.parse(
    request.query,
  )

  const fetchUserTrainmentsUseCase = makeFetchUserTrainmentsUseCase()

  const { trainments } = await fetchUserTrainmentsUseCase.execute({
    userId: request.user.sub,
    page,
    ...(trainmentTemplateId ? { trainmentTemplateId } : {}),
  })

  return reply
    .status(200)
    .send({ trainments: trainments.map(trainmentToHTTP), page })
}
