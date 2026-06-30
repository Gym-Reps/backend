import type { FastifyInstance } from 'fastify'
import { verifyJWT } from '@/http/middlewares/verify-jwt'
import { authenticate } from './authenticate/authenticate'
import { changePassword } from './change-password/change-password'
import { refresh } from './refresh/refresh'
import { register } from './register/register'

export async function userRoutes(app: FastifyInstance) {
  app.post('/users', register)
  app.post('/sessions', authenticate)
  app.patch('/token/refresh', refresh)

  app.patch(
    '/users/password',
    { onRequest: [verifyJWT] },
    changePassword,
  )
}
