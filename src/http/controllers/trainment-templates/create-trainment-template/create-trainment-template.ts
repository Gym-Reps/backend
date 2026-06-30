import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeCreateTrainmentTemplateUseCase } from '@/use-cases/_factories/make-create-trainment-template-use-case'
import { trainmentTemplateToHTTP } from '../trainment-template-presenter'

export async function createTrainmentTemplate(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const createTrainmentTemplateBodySchema = z.object({
    title: z.string().min(1),
  })

  const { title } = createTrainmentTemplateBodySchema.parse(request.body)

  const createTrainmentTemplateUseCase = makeCreateTrainmentTemplateUseCase()

  const { trainmentTemplate } = await createTrainmentTemplateUseCase.execute({
    userId: request.user.sub,
    title,
  })

  return reply
    .status(201)
    .send({ trainmentTemplate: trainmentTemplateToHTTP(trainmentTemplate) })
}
