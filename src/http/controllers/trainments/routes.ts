import type { FastifyInstance } from 'fastify'
import { verifyJWT } from '@/http/middlewares/verify-jwt'
import { fetchUserTrainments } from './fetch-user-trainments/fetch-user-trainments'
import { finishTrainment } from './finish-trainment/finish-trainment'
import { getTrainment } from './get-trainment/get-trainment'
import { getWeeklyProgress } from './get-weekly-progress/get-weekly-progress'
import { startTrainment } from './start-trainment/start-trainment'

export async function trainmentRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJWT)

  app.post('/trainments', startTrainment)
  app.patch('/trainments/:id/finish', finishTrainment)
  app.get('/trainments', fetchUserTrainments)
  // Register the literal path before `/trainments/:id` so it isn't captured by
  // the `:id` param.
  app.get('/trainments/weekly-progress', getWeeklyProgress)
  app.get('/trainments/:id', getTrainment)
}
