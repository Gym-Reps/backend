import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { UserAlreadyExistsError } from '@/use-cases/errors/user-already-exists-error'
import { makeCreateDefaultUserPreferencesUseCase } from '@/use-cases/_factories/make-create-default-user-preferences-use-case'
import { makeRegisterUseCase } from '@/use-cases/_factories/make-register-use-case'

export async function register(request: FastifyRequest, reply: FastifyReply) {
  const registerBodySchema = z.object({
    username: z.string().min(1),
    email: z.email(),
    password: z.string().min(6),
  })

  const { username, email, password } = registerBodySchema.parse(request.body)

  try {
    const registerUseCase = makeRegisterUseCase()

    const { user } = await registerUseCase.execute({
      username,
      email,
      password,
    })

    // Seed the user's default preferences row (02_USER_PREFERENCES) so
    // GET /preferences and the weekly-progress goal have a row to read.
    await makeCreateDefaultUserPreferencesUseCase().execute({ userId: user.id })
  } catch (err) {
    if (err instanceof UserAlreadyExistsError) {
      return reply.status(409).send({ message: err.message })
    }

    throw err
  }

  return reply.status(201).send()
}
