import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeChangePasswordUseCase } from '@/use-cases/_factories/make-change-password-use-case'
import { InvalidCredentialsError } from '@/use-cases/errors/invalid-credentials-error'
import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error'

export async function changePassword(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const changePasswordBodySchema = z.object({
    currentPassword: z.string().min(6),
    newPassword: z.string().min(6),
  })

  const { currentPassword, newPassword } = changePasswordBodySchema.parse(
    request.body,
  )

  try {
    const changePasswordUseCase = makeChangePasswordUseCase()

    await changePasswordUseCase.execute({
      userId: request.user.sub,
      currentPassword,
      newPassword,
    })
  } catch (err) {
    if (err instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: err.message })
    }

    if (err instanceof InvalidCredentialsError) {
      return reply.status(400).send({ message: err.message })
    }

    throw err
  }

  return reply.status(204).send()
}
