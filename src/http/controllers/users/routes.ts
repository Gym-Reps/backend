import type { FastifyInstance } from 'fastify'
import { verifyJWT } from '@/http/middlewares/verify-jwt'
import { authenticate } from './authenticate/authenticate'
import { changePassword } from './change-password/change-password'
import { register } from './register/register'

export async function userRoutes(app: FastifyInstance) {
  app.post('/users', register)
  app.post('/sessions', authenticate)

  app.patch(
    '/users/password',
    { onRequest: [verifyJWT] },
    changePassword,
  )
}
