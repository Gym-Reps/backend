import type { FastifyInstance } from 'fastify'
import { verifyJWT } from '@/http/middlewares/verify-jwt'
import { getPreferences } from './get-preferences/get-preferences'
import { updatePreferences } from './update-preferences/update-preferences'

export async function preferenceRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJWT)

  app.get('/preferences', getPreferences)
  app.patch('/preferences', updatePreferences)
}
