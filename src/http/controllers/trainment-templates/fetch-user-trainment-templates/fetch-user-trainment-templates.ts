import type { FastifyReply, FastifyRequest } from 'fastify'
import { makeFetchUserTrainmentTemplatesUseCase } from '@/use-cases/_factories/make-fetch-user-trainment-templates-use-case'
import { trainmentTemplateToHTTP } from '../trainment-template-presenter'

export async function fetchUserTrainmentTemplates(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const fetchUserTrainmentTemplatesUseCase =
    makeFetchUserTrainmentTemplatesUseCase()

  const { trainmentTemplates } =
    await fetchUserTrainmentTemplatesUseCase.execute({
      userId: request.user.sub,
    })

  return reply.status(200).send({
    trainmentTemplates: trainmentTemplates.map(trainmentTemplateToHTTP),
  })
}
