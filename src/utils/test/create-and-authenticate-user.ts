import type { FastifyInstance } from 'fastify'
import request from 'supertest'

interface CreateAndAuthenticateUserParams {
  username?: string
  email?: string
}

/**
 * Registers a user and signs in, returning a Bearer token. Pass distinct
 * username/email when a test needs more than one user in the same schema.
 */
export async function createAndAuthenticateUser(
  app: FastifyInstance,
  { username = 'johndoe', email = 'johndoe@example.com' }:
    CreateAndAuthenticateUserParams = {},
) {
  await request(app.server).post('/users').send({
    username,
    email,
    password: '123456',
  })

  const authResponse = await request(app.server).post('/sessions').send({
    email,
    password: '123456',
  })

  const token = authResponse.body.token as string

  return { token }
}
