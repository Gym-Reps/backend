import type { FastifyInstance } from 'fastify'
import request from 'supertest'
import { prisma } from '@/lib/prisma'

interface CreateAndAuthenticateUserParams {
  username?: string
  email?: string
  isAdmin?: boolean
}

/**
 * Registers a user and signs in, returning a Bearer token. Pass distinct
 * username/email when a test needs more than one user in the same schema.
 * Set `isAdmin` to promote the user to ADMIN before signing in, so the issued
 * token carries the ADMIN role.
 */
export async function createAndAuthenticateUser(
  app: FastifyInstance,
  {
    username = 'johndoe',
    email = 'johndoe@example.com',
    isAdmin = false,
  }: CreateAndAuthenticateUserParams = {},
) {
  await request(app.server).post('/users').send({
    username,
    email,
    password: '123456',
  })

  if (isAdmin) {
    await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' },
    })
  }

  const authResponse = await request(app.server).post('/sessions').send({
    email,
    password: '123456',
  })

  const token = authResponse.body.token as string

  return { token }
}
