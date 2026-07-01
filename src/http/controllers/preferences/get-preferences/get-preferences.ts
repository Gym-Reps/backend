import type { FastifyReply, FastifyRequest } from 'fastify'
import { makeGetUserPreferencesUseCase } from '@/use-cases/_factories/make-get-user-preferences-use-case'
import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error'
import { preferencesToHTTP } from '../preferences-presenter'

export async function getPreferences(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const useCase = makeGetUserPreferencesUseCase()

    const { userPreferences } = await useCase.execute({
      userId: request.user.sub,
    })

    return reply
      .status(200)
      .send({ preferences: preferencesToHTTP(userPreferences) })
  } catch (err) {
    if (err instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: err.message })
    }

    throw err
  }
}
